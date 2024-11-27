# SES Sync Action

GitHub Action to sync E-Mail templates to Amazon Simple Email Service (SES).

A very basic configuration for syncing templates from a directory `templates` to SES:

```yaml
- uses: osiegmar/ses-sync-action@v1
  with:
    dir: templates
```

The directory `templates` has to contain the following three files for each template:

- `[basename].json`: A template configuration file.
- `[basename].txt`: The plain text body of the E-Mail.
- `[basename].html`: The HTML body of the E-Mail.

The `[basename]` is the name of the template and has to be the same for all three files.

The template configuration file has to be a JSON file with the following structure:

```json
{
  "Subject": "Subject of the E-Mail"
}
```

> [!NOTE]  
> Currently, this action does not support deleting templates.

## Authentication

This action requires
standard [AWS environment variables](https://docs.aws.amazon.com/sdkref/latest/guide/settings-reference.html#EVarSettings)
set.

Most common are `AWS_REGION`, `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.

You can configure these environment variables either by using the
[aws-actions/configure-aws-credentials](https://github.com/marketplace/actions/configure-aws-credentials-action-for-github-actions)
action (which is recommended) or by setting them manually.

### Authentication via configure-aws-credentials-action

This example shows the use
of [aws-actions/configure-aws-credentials](https://github.com/marketplace/actions/configure-aws-credentials-action-for-github-actions)
in order to authenticate against AWS.

```yaml
on: [ push ]

jobs:
  build:

    runs-on: ubuntu-latest

    # These permissions are needed to interact with GitHub's OIDC Token endpoint.
    permissions:
      id-token: write
      contents: read

    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::XXXXXXXXXXXX:role/github-actions
          aws-region: eu-central-1

      - uses: osiegmar/ses-sync-action@v1
        with:
          dir: templates
```

### Manual authentication

You can also use
GitHubs [Encrypted secrets](https://docs.github.com/de/actions/security-guides/encrypted-secrets)
feature to configure authentication manually. **This is not recommended!**

```yaml
- uses: osiegmar/ses-sync-action@v1
  with:
    dir: templates
  env:
    AWS_REGION: eu-central-1
    AWS_ACCESS_KEY_ID: ${{ secrets.access_key_id }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.secret_access_key }}
```

## Authorization

Regardless of the way you configure the authentication you need to configure
a policy for granting the necessary permissions.

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
              "ses:ListEmailTemplates",
              "ses:CreateEmailTemplate",
              "ses:UpdateEmailTemplate"
            ],
            "Resource": "*"
        }
    ]
}
```
