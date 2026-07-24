export const metadata = {
  title: "바이브 코딩 해커톤 특강",
  description: "바이브 코딩 1시간 특강 슬라이드",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
