# EC2 단일 인스턴스 배포

## 1. AWS 리소스

1. 서울 리전(`ap-northeast-2`)에 Ubuntu EC2 인스턴스와 Elastic IP를 만든다.
2. Security Group은 HTTP(80), HTTPS(443), 관리용 SSH(22, 개인 IP로 제한)만 허용한다.
3. S3 버킷을 만들고 `blog/*` object의 public read 또는 CloudFront origin access를 설정한다.
4. EC2 IAM Role에는 대상 버킷의 `blog/*`에 한정한 `s3:PutObject`, `s3:GetObject` 권한만 부여한다.

## 2. 서버 초기 설정

```bash
sudo apt update
sudo apt install -y git caddy
corepack enable
sudo mkdir -p /srv/jinhee.works
sudo chown -R ubuntu:ubuntu /srv/jinhee.works
git clone <repository-url> /srv/jinhee.works
cd /srv/jinhee.works && corepack pnpm install --frozen-lockfile
```

`/etc/jinhee.works.env`에는 아래 값을 저장하고 권한을 `600`으로 제한한다.

```dotenv
NOTION_TOKEN=
NOTION_DATA_SOURCE_ID=
NOTION_WEBHOOK_SECRET=
AWS_REGION=ap-northeast-2
AWS_S3_BUCKET=
AWS_S3_PUBLIC_BASE_URL=
```

`infra/ec2/jinhee-works.service`를 `/etc/systemd/system/`에, `infra/ec2/Caddyfile`을 `/etc/caddy/Caddyfile`에 복사한 뒤 `YOUR_DOMAIN`을 실제 도메인으로 바꾼다. 이후 `sudo systemctl daemon-reload`, `sudo systemctl enable --now jinhee-works caddy`를 실행한다.

## 3. 초기 이미지 동기화와 webhook

첫 배포 전에 환경 변수를 불러온 뒤 한 번만 실행한다.

```bash
cd /srv/jinhee.works
set -a && source /etc/jinhee.works.env && set +a
corepack pnpm sync:notion-assets
```

Notion connection settings에서 `https://YOUR_DOMAIN/api/notion/webhook`을 구독 URL로 등록하고, verification payload의 토큰을 `NOTION_WEBHOOK_SECRET`에 저장한 뒤 subscription을 검증한다. 이후 Notion 변경 webhook이 이미지를 S3에 복사하고 캐시를 선택적으로 무효화한다.

## 4. GitHub Actions

Repository secrets에 `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`를 등록한다. `main` push는 서버에서 의존성 설치·build·systemd 재시작만 실행한다. 콘텐츠 변경을 위한 예약 workflow는 사용하지 않는다.
