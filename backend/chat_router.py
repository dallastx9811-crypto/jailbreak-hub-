"""Chat assistant grounded in the jailbreak catalog.

Uses Claude via the Anthropic SDK.
Conversation history is stored in MongoDB so sessions persist.
"""
import os
import uuid
from datetime import datetime, timezone
from typing import List, Optional

import anthropic
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field


def build_system_prompt(tools, devices, ios_versions, tool_details):
    tool_lines = []
    for t in tools:
        det = tool_details.get(t["id"], {})
        cmds = det.get("commands", [])
        cmd_summary = "; ".join(f"{c['label']}: {c['code']}" for c in cmds[:3])
        tool_lines.append(
            f"- {t['name']} (id={t['id']}) — {t['type']}, "
            f"iOS {t['ios_min']}–{t['ios_max']}, SoC {','.join(t['soc'])}, "
            f"{'rootful' if t['rootful'] else 'rootless'}, "
            f"pkg={t['package_manager']}, status={t['status']}, "
            f"site={t['url']}. Commands: {cmd_summary or 'see /tool/' + t['id']}"
        )
    devices_str = ", ".join(f"{d['name']} ({d['soc']})" for d in devices)
    versions_str = ", ".join(ios_versions[:20]) + (" …" if len(ios_versions) > 20 else "")

    return f"""You are JB-Hub Assistant, a knowledgeable, friendly guide for iOS \
jailbreak research and education. You answer questions strictly based on the \
catalog below. You never invent tools, exploits, or commands that are not in \
the catalog. If a user asks about a device/iOS combination not covered, you \
say so honestly.

EDUCATIONAL DISCLAIMER: Always remind users that jailbreaking voids warranty, \
weakens security, and may be regulated by their jurisdiction. Suggest they \
verify binaries from the official project site before running anything.

When a user describes their device + iOS version:
1. Identify which tools (if any) match by SoC and version range.
2. Give a short, structured walkthrough citing the tool by name.
3. Include 1–3 of the actual install commands from the catalog (use code blocks).
4. Link to the in-app tool detail page using the path /tool/<id>.
5. Mention the official project site for binary verification.

Format responses in clean markdown with short paragraphs and code blocks for \
commands. Keep the tone direct, technical, no emojis.

=== CATALOG: TOOLS ===
{chr(10).join(tool_lines)}

=== CATALOG: DEVICES ===
{devices_str}

=== CATALOG: IOS VERSIONS ===
{versions_str}

If asked something off-topic (not iOS jailbreaking related), politely steer \
back. If a user asks for harmful content or anything illegal beyond \
jailbreaking, refuse.
"""


def make_chat_router(db, tools, devices, ios_versions, tool_details):
    router = APIRouter(prefix="/api/chat", tags=["chat"])

    SYSTEM_PROMPT = build_system_prompt(tools, devices, ios_versions, tool_details)
    ANTHROPIC_KEY = os.environ.get("ANTHROPIC_API_KEY")

    class ChatRequest(BaseModel):
        message: str
        session_id: Optional[str] = None

    class ChatMessage(BaseModel):
        role: str
        content: str
        ts: str

    class ChatResponse(BaseModel):
        session_id: str
        reply: str
        messages: List[ChatMessage]

    @router.post("", response_model=ChatResponse)
    async def chat(req: ChatRequest):
        if not ANTHROPIC_KEY:
            raise HTTPException(status_code=503, detail="LLM key not configured")
        if not req.message or not req.message.strip():
            raise HTTPException(status_code=400, detail="Message is required")

        session_id = req.session_id or str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()

        # Fetch prior history for this session
        cursor = db.chat_messages.find(
            {"session_id": session_id}, {"_id": 0}
        ).sort("ts", 1)
        prior = await cursor.to_list(length=200)

        messages = [{"role": m["role"], "content": m["content"]} for m in prior]
        messages.append({"role": "user", "content": req.message})

        try:
            client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)
            response = client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=1024,
                system=SYSTEM_PROMPT,
                messages=messages,
            )
            reply_text = response.content[0].text
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"LLM error: {e}")

        await db.chat_messages.insert_many([
            {
                "session_id": session_id,
                "role": "user",
                "content": req.message,
                "ts": now,
            },
            {
                "session_id": session_id,
                "role": "assistant",
                "content": reply_text,
                "ts": datetime.now(timezone.utc).isoformat(),
            },
        ])

        cursor = db.chat_messages.find(
            {"session_id": session_id}, {"_id": 0}
        ).sort("ts", 1)
        history_raw = await cursor.to_list(length=200)
        history = [
            ChatMessage(role=m["role"], content=m["content"], ts=m["ts"])
            for m in history_raw
        ]

        return ChatResponse(
            session_id=session_id, reply=reply_text, messages=history
        )

    @router.get("/{session_id}", response_model=List[ChatMessage])
    async def get_history(session_id: str):
        cursor = db.chat_messages.find(
            {"session_id": session_id}, {"_id": 0}
        ).sort("ts", 1)
        history = await cursor.to_list(length=200)
        return [
            ChatMessage(role=m["role"], content=m["content"], ts=m["ts"])
            for m in history
        ]

    return router
