# Amazon Bedrock Setup Guide for LifePilot AI

LifePilot AI integrates with Amazon Bedrock using the official AWS SDK for JavaScript v3 (`@aws-sdk/client-bedrock-runtime`) and the Converse API (`ConverseCommand`).

This guide details how to configure model access, credentials, and IAM permissions to run in **Bedrock Mode**.

---

## 1. Prerequisites

1. An active AWS Account.
2. An AWS region where Amazon Bedrock is supported (e.g., `us-east-1` (N. Virginia), `us-west-2` (Oregon), or `eu-central-1` (Frankfurt)).
3. Model Access enabled in the Bedrock console.

---

## 2. Enable Model Access in AWS Bedrock Console

1. Navigate to the **Amazon Bedrock Console**: [https://console.aws.amazon.com/bedrock/](https://console.aws.amazon.com/bedrock/)
2. In the left navigation bar, choose **Model access**.
3. Click **Modify model access**.
4. Select the model you wish to use:
   - **Recommended:** `Anthropic Claude 3.5 Sonnet` (`anthropic.claude-3-5-sonnet-20240620-v1:0`)
   - **Alternative:** `Anthropic Claude 3 Haiku` (`anthropic.claude-3-haiku-20240307-v1:0`)
   - **Alternative:** `Amazon Nova Pro` or `Amazon Nova Micro`
5. Click **Save changes** and wait until the status displays **Access granted**.

---

## 3. Minimal IAM Permissions Policy

Attach the following minimal IAM policy to your IAM User or IAM Role:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "BedrockConverseAccess",
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": [
        "arn:aws:bedrock:*::foundation-model/*"
      ]
    }
  ]
}
```

---

## 4. Local Configuration

Create a file named `.env.local` in the project root:

```bash
# AWS Region
AWS_REGION=us-east-1

# Target Bedrock Model ID
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20240620-v1:0

# AWS Credentials (Server-side only)
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

# Optional: Session Token (if using temporary credentials/STS)
# AWS_SESSION_TOKEN=AQoDYXdzEJr1...
```

*Note: Alternatively, if you already have the AWS CLI configured with `aws configure`, LifePilot AI will automatically discover credentials via the standard AWS credential provider chain.*

---

## 5. Verifying Connection in the App

1. Run the application:
   ```bash
   npm run dev
   ```
2. Open `http://localhost:3000/settings`.
3. Under **Amazon Bedrock Configuration Status**, click **Test Connection**.
4. If configured properly, the indicator will turn green: **Verified & Connected**.
5. Switch the active AI Engine Provider to **Amazon Bedrock Mode**.

---

## 6. Safe Decoupling (Demo Mode Fallback)

If AWS credentials are not available or expire:
- The app clearly highlights this in the UI.
- You can switch with one click to **Demo Mode**, which executes the exact same application tools deterministically with zero external cloud dependencies.
- The app will **never silently simulate** a response when Bedrock mode is selected.
