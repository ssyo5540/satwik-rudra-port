# Hosting: S3 + CloudFront

The site is a static export (`out/`), served from a private S3 bucket behind CloudFront at
https://www.satwikrudra.com. The bare satwikrudra.com forwards to www at GoDaddy.
No server runs. Pushes to `main` publish through `.github/workflows/deploy.yml`.

AWS account: the default CLI profile on Satwik's Mac (211125767157), region us-east-1.
Stack: `satwik-portfolio`.

## One-time setup (already done on 2026-11-19)

1. **Certificate** (us-east-1, CloudFront only accepts certificates from there):

   ```bash
   aws acm request-certificate --region us-east-1 \
     --domain-name www.satwikrudra.com --validation-method DNS
   aws acm describe-certificate --region us-east-1 --certificate-arn <arn> \
     --query 'Certificate.DomainValidationOptions[].ResourceRecord'
   ```

   Add the `_xxxx.www` CNAME it prints at GoDaddy (DNS → Add record, Type CNAME, name without
   `.satwikrudra.com.`). **Keep that record**: ACM uses it to renew the certificate every year.

2. **Stack**, once the certificate shows `ISSUED`:

   ```bash
   aws cloudformation deploy --region us-east-1 --stack-name satwik-portfolio \
     --template-file infra/template.yaml --capabilities CAPABILITY_NAMED_IAM \
     --parameter-overrides CertificateArn=<arn>
   aws cloudformation describe-stacks --region us-east-1 --stack-name satwik-portfolio \
     --query 'Stacks[0].Outputs'
   ```

3. **Repository variables** (Settings → Secrets and variables → Actions → Variables), from the
   outputs: `AWS_DEPLOY_ROLE_ARN`, `SITE_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID`. None are secret.

4. **DNS at GoDaddy**:
   - `www` CNAME → the `DistributionDomain` output (`xxxx.cloudfront.net`).
   - Bare domain: Forwarding → `https://www.satwikrudra.com`, permanent (301).

## Publishing by hand

```bash
npm ci && npm run build
aws s3 sync out s3://<bucket> --delete
aws cloudfront create-invalidation --distribution-id <id> --paths "/*"
```

The workflow does the same with sensible cache headers; prefer pushing to `main`.

## Cost

S3 storage for ~11 MB plus CloudFront requests and transfer: cents a month for a portfolio's
traffic. CloudFront's always-free allowance (1 TB out, 10 M requests a month) covers most of it.
