// ============================================================
// VRC Live Market
// 認証関連エラーメッセージ変換
// ============================================================

export function getAuthErrorMessage(
  error: unknown
): string {
  const rawMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";

  const message =
    rawMessage
      .trim()
      .toLowerCase();


  // ==========================================================
  // メール送信制限
  // ==========================================================

  if (
    message.includes(
      "email rate limit exceeded"
    ) ||
    message.includes(
      "rate limit"
    )
  ) {
    return "現在メール送信が混み合っています。しばらく時間をおいてから、もう一度お試しください。";
  }


  // ==========================================================
  // ログイン情報
  // ==========================================================

  if (
    message.includes(
      "invalid login credentials"
    )
  ) {
    return "メールアドレスまたはパスワードが正しくありません。";
  }


  if (
    message.includes(
      "email not confirmed"
    )
  ) {
    return "メールアドレスの確認が完了していません。確認メールをご確認ください。";
  }


  // ==========================================================
  // メールアドレス
  // ==========================================================

  if (
    message.includes(
      "invalid email"
    )
  ) {
    return "メールアドレスの形式が正しくありません。";
  }


  if (
    message.includes(
      "user already registered"
    ) ||
    message.includes(
      "already been registered"
    )
  ) {
    return "このメールアドレスはすでに登録されています。ログインをお試しください。";
  }


  // ==========================================================
  // パスワード
  // ==========================================================

  if (
    message.includes(
      "password should be at least"
    ) ||
    message.includes(
      "password is too short"
    )
  ) {
    return "パスワードが短すぎます。6文字以上で入力してください。";
  }


  if (
    message.includes(
      "same password"
    )
  ) {
    return "現在と同じパスワードは設定できません。別のパスワードを入力してください。";
  }


  // ==========================================================
  // リカバリーリンク
  // ==========================================================

  if (
    message.includes(
      "otp expired"
    ) ||
    message.includes(
      "token has expired"
    ) ||
    message.includes(
      "expired"
    )
  ) {
    return "このリンクは有効期限が切れています。もう一度再設定メールを送信してください。";
  }


  if (
    message.includes(
      "invalid token"
    ) ||
    message.includes(
      "invalid otp"
    )
  ) {
    return "このリンクは無効です。もう一度再設定メールを送信してください。";
  }


  // ==========================================================
  // ネットワーク系
  // ==========================================================

  if (
    message.includes(
      "failed to fetch"
    ) ||
    message.includes(
      "network"
    )
  ) {
    return "通信に失敗しました。インターネット接続をご確認のうえ、もう一度お試しください。";
  }


  // ==========================================================
  // 招待コード
  // ==========================================================

  if (
    message.includes(
      "招待コードが正しくありません"
    )
  ) {
    return "招待コードが正しくありません。入力内容をご確認ください。";
  }


  if (
    message.includes(
      "招待コードは現在使用できません"
    )
  ) {
    return "この招待コードは現在使用できません。";
  }


  if (
    message.includes(
      "招待コードはすでに使用されています"
    ) ||
    message.includes(
      "招待コードはすでに使用された可能性があります"
    )
  ) {
    return "この招待コードはすでに使用されています。";
  }


  if (
    message.includes(
      "招待コードは有効期限が切れています"
    )
  ) {
    return "この招待コードは有効期限が切れています。";
  }


  // ==========================================================
  // デフォルト
  // ==========================================================

  return "処理中にエラーが発生しました。時間をおいて、もう一度お試しください。";
}