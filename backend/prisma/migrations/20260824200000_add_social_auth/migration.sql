-- Amora social authentication: Apple/Facebook/Google identity links
CREATE TABLE "OAuthAccount" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "email" TEXT,
    "refresh_token_encrypted" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OAuthAccount_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OAuthAccount_provider_provider_account_id_key"
ON "OAuthAccount"("provider", "provider_account_id");

CREATE INDEX "OAuthAccount_user_id_provider_idx"
ON "OAuthAccount"("user_id", "provider");

ALTER TABLE "OAuthAccount"
ADD CONSTRAINT "OAuthAccount_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "OAuthHandoff" (
    "id" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "user_id" TEXT,
    "provider_account_id" TEXT,
    "email" TEXT,
    "display_name" TEXT,
    "refresh_token_encrypted" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "consumed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OAuthHandoff_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OAuthHandoff_code_hash_key"
ON "OAuthHandoff"("code_hash");

CREATE INDEX "OAuthHandoff_expires_at_idx"
ON "OAuthHandoff"("expires_at");
