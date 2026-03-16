## Alphabet Synth React App

간단한 React + TypeScript 앱으로, 키보드에서 A–Z를 누르면 화면에 컬러 글자가 애니메이션으로 떠오르면서 Web Audio API로 짧은 음이 재생됩니다.

### 프로젝트 구조

- **root**
  - `package.json` – 의존성 및 스크립트 (`npm run dev`, `npm run build` 등)
  - `tsconfig.json` – TypeScript 설정
  - `vite.config.ts` – Vite + React 설정
  - `index.html` – 엔트리 HTML
- **src**
  - `main.tsx` – React 엔트리, `App` 렌더링
  - `App.tsx` – 질문에 주신 코드가 들어 있는 메인 컴포넌트
  - `styles.css` – 기본 스타일 및 유틸 클래스(Tailwind 느낌의 몇 개만 정의)
  - **components**
    - `animated-letter.tsx` – 개별 글자를 Motion 애니메이션으로 렌더링, `PALETTE`, `ANIMATION_DURATION`, 타입(`PaletteColor`, `LetterStyle`) 정의
  - **lib**
    - `synth.ts` – `playKey(letter: string)` 구현, Web Audio API 로 글자별 음계 매핑

### 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 표시된 로컬 주소로 접속한 뒤, 키보드에서 A–Z 아무 키나 눌러보면 됩니다.

