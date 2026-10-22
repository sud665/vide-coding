import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '오늘 뭐 보지? — 서울 문화행사 탐색',
  description: '서울시 문화행사 공공데이터를 검색하고 공식 원문으로 확인하는 강의용 앱',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
