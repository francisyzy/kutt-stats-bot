# KUTT.IT Bot

Get your kutt link stats and create new links!

<div align="center">
<a href="http://go.francisyzy.com/t-me-kutt-it-bot">
<img src="https://user-images.githubusercontent.com/24467184/147849174-3c3e509c-b564-4dea-877b-54858b3bac57.png" alt="TelegramQR">
</a>
</div>

<details>
<summary>Actions secrets</summary>
<p>
If you fork this project and want to deploy the project to AWS Lambda, you'll need the following to be set in Github Actions secrets

```
ADMIN_TELEGRAM_ID: For the owner of the bot to check stats
API_TOKEN: telegram API Key (Generate from botfather https://t.me/botfather)
AWS_ACCESS_KEY_ID: serverless requires this to deploy
AWS_SECRET_ACCESS_KEY: serverless requires this to deploy
DATABASE_URL: https://www.prisma.io/dataplatform connection string
KUTT_API_TOKEN: 'public' kutt token for other people to short link
```

</p>
</details>

Check out [Kutt.it](https://github.com/thedevs-network/kutt) repo too!
