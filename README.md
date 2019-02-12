# nuxt-graphpack-sample
フロントに **[Nuxt.js](https://ja.nuxtjs.org/)**、バックエンドに **[Graphpack](https://github.com/glennreyes/graphpack)**を使った**GraphQLのサンプルアプリケーション**です。
ユーザー情報の操作を通して、Query, Mutation, Subscriptionの使い方を紹介しています。
バックエンドは、AppSyncなどのサービスを使うわけでなはなく、ローカルで完結するものになっています。
データは仮で用意しているのでDB構築なども必要ありません。
本リポジトリをクローンしていただいて、[Getting Start](#getting-start)の手順を実施するとサンプルアプリをブラウザから動かすことができます。

## フォルダ構成 
* [client](./client)
  * Nuxt.js＋Apollo Clientで実装したクライアントサイドのGraphQLアプリケーションです。
* [client_vuetify](./client_vuetify)
  * [client](./client)の見た目をVuetifyで綺麗にした版です。
* [server](./server)
  * Graphpackを使って実装したサーバーサイドのGraphQLアプリケーションです。

## 参考記事
コチラのソースコードの詳細は、以下でも紹介しています。あわせてご覧ください。
* [Nuxt.js＋Apollo ClientでCRUD操作 / ユーザー管理画面でQuery, Mutation, Subscriptionを実装](https://takumon.com/nuxt-apollo-with-graphpack)
* [設定いらずのNode製GraphQLサーバー「Graphpack」の使い方 / Query, Mutation, Subscriptionを試す](https://takumon.com/graphpack-graphql-zero-config-server)



This is A sample application of GraphQL using Nuxt.js as the front end and Graphpack as the back end

## Getting Start

* Firtst, You run Graphpack Server.

```
cd server
npm i
npm run dev
```

* Second, You run Nuxt App.

```
cd client
npm i 
npm run dev
```

* Finally, You can access htttp:localhost:3000 from the browser!


