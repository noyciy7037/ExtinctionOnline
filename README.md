# Extinction Online
とあるカードゲーム(ローカル)をオンライン実装したい計画。

## クライアント
/index.htmlをブラウザで開く。主にJavaScript製。

## サーバー
/ExtinctionOnline.Server/以下。C#製で通信はWebSocket。

## 今後の計画
- とりあえず動かす
- SSL対応とか
- パフォーマンス改善
- チート防止(ホストクライアントを除くプレイヤーの不正防止)
- 移植(Unityとか使ってグラフィックも凝りたい)