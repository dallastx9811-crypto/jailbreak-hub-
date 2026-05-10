from fastapi import APIRouter, HTTPException, Depends, Request
import stripe
import os
from datetime import datetime, timezone


def make_payments_router(db, get_current_user):
    router = APIRouter(prefix="/api/payments")
    stripe.api_key = os.environ.get("STRIPE_SECRET_KEY", "")
    WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")
    FRONTEND_URL = os.environ.get(
        "FRONTEND_URL", "https://jailbreak-hub.vercel.app"
    )

    @router.post("/checkout")
    async def create_checkout(current_user=Depends(get_current_user)):
        if current_user.get("has_paid"):
            raise HTTPException(status_code=400, detail="Already paid")
        if not stripe.api_key:
            raise HTTPException(
                status_code=503, detail="Payment system not configured"
            )
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": "usd",
                        "product_data": {"name": "Jailbreak Hub — Lifetime Access"},
                        "unit_amount": 250,
                    },
                    "quantity": 1,
                }
            ],
            mode="payment",
            customer_email=current_user["email"],
            metadata={"user_id": current_user["id"]},
            success_url=f"{FRONTEND_URL}?payment=success",
            cancel_url=f"{FRONTEND_URL}?payment=cancelled",
        )
        return {"url": session.url}

    @router.post("/webhook")
    async def webhook(request: Request):
        payload = await request.body()
        sig_header = request.headers.get("stripe-signature")
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, WEBHOOK_SECRET
            )
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid webhook")

        if event["type"] == "checkout.session.completed":
            session_obj = event["data"]["object"]
            user_id = (session_obj.get("metadata") or {}).get("user_id")
            if user_id:
                await db.users.update_one(
                    {"id": user_id},
                    {
                        "$set": {
                            "has_paid": True,
                            "paid_at": datetime.now(timezone.utc).isoformat(),
                        }
                    },
                )
        return {"status": "ok"}

    @router.get("/status")
    async def payment_status(current_user=Depends(get_current_user)):
        return {"has_paid": current_user.get("has_paid", False)}

    return router
