# Vocabulary assistant 튜토리얼

## 한글 설명

이 튜토리얼은 [Vocabulary assitant web application](https://huggingface.co/spaces/hksung/english-vocab-interface-test)을 로컬 컴퓨터에서 실행하고 수정하는 방법을 단계별로 설명합니다. 

이 튜토리얼에서 설명하는 내용은 다음과 같습니다.

1. [필요한 프로그램 설치](#1-필요한-프로그램-설치)
    - [Python 설치](#11-python-설치)
    - [코드 편집기 설치](#12-코드-편집기-설치)
    - [Ollama 설치](#13-ollama-설치)
2. GitHub에서 프로젝트 다운로드
3. Python 환경 설정
4. 프로젝트 실행
5. AI 프롬프트 수정
6. 웹 인터페이스 수정

---

# 1. 필요한 프로그램 설치
이 프로젝트를 실행하려면 다음 프로그램이 반드시 필요합니다.

## 1.1 Python 설치
- Python을 먼저 설치합니다.
- 다운로드 링크: https://www.python.org/downloads/
- 이 튜토리얼에서는 Python 3.9 이상이면 정상적으로 작동합니다.
### 1.1.1. Windows
- 설치할 때 반드시 다음 옵션을 체크합니다.

```
Add Python to PATH
```

### 1.1.2. Mac
- Mac에서는 보통 Python 설치 프로그램을 실행하면 자동으로 설정됩니다.
- 다운로드한 `.pkg` 파일을 실행하고 **Continue → Install**을 클릭합니다.

## 1.2 Python 설치 확인
- 설치가 완료되었는지 확인하려면 터미널(명령어 창) 을 열어 다음 명령어를 입력합니다.

### 1.2.1. Windows
- 시작 메뉴를 엽니다.
- **Command Prompt** 또는 **cmd** 를 검색합니다.
- 프로그램을 실행합니다.
- 창이 열리면 입력

```bash
python --version
```

### 1.2.2. Mac
- `Command + Space` 를 누릅니다.  
- **Terminal**을 검색하여 실행합니다.
- 터미널이 열리면 입력

```bash
python3 --version
```
버전 번호가 출력되면 정상적으로 설치된 것입니다.

---

## 1.2 코드 편집기 설치 

이 프로젝트의 파일을 수정하려면 코드 편집기(code editor) 가 필요합니다. 가장 많이 사용하는 무료 편집기는 Visual Studio Code (VS Code) 입니다.
- 다운로드: https://code.visualstudio.com/
- 설치 후 프로그램을 실행합니다.
- 이미 다른 코드 편집기를 사용하고 있다면 그대로 사용해도 괜찮습니다. 예를 들어 다음과 같은 프로그램을 사용할 수 있습니다.
    - PyCharm
    - Cursor
    - Sublime Text
    - Notepad++
    - 기본 텍스트 편집기 (TextEdit, Notepad 등)

---

## 1.3 Ollama 설치

이 프로젝트는 AI 분석을 위해 *Ollama*를 사용합니다.
Ollama를 사용하면 무료로 로컬 AI 모델을 실행할 수 있습니다.
이 튜토리얼에서는 gpt-oss:20b 모델을 사용합니다.
- 다운로드 [https://ollama.com](https://ollama.com)

### 1.3.1. Windows
- 다운로드 링크에서 Download for *Windows*를 클릭합니다.
- 다운로드된 **.exe 파일**을 실행합니다.
- 설치 과정을 진행합니다.
- 설치가 완료되면 Ollama가 자동으로 실행됩니다.

### 1.3.2. Mac
- 다운로드 링크에서 Download for *macOS*를 클릭합니다.
- 다운로드된 **.dmg 파일**을 실행합니다.
- Ollama 아이콘을 Applications 폴더로 드래그합니다.
- Applications에서 Ollama를 실행합니다. (처음 실행하면, Ollama가 백그라운드에서 실행됩니다.)

### 1.3.3. 모델 다운로드 (중요)

이 튜토리얼에서는 *gpt-oss:20b* 모델 (무료, 오픈 모델)을 사용합니다.
터미널을 열고 다음 명령어를 입력합니다.

```bash
ollama run gpt-oss:20b
```

- 처음 실행하면 모델이 자동으로 다운로드됩니다.
- 모델 크기가 크기 때문에 다운로드에 몇 분 정도 걸릴 수 있습니다.
- 다운로드가 완료되면 모델이 실행됩니다. (이 과정은 처음 한 번만 필요합니다.)
- `gpt-oss:20b` 모델은 로컬 컴퓨터에서 실행되기 때문에 API 키나 비용이 필요하지 않습니다.
- Ollama에서는 [다른 모델](https://ollama.com/search)도 사용할 수 있습니다. 예를 들어

```bash
ollama run llama3
```

또는

```bash
ollama run mistral
```

---

# 2. GitHub에서 프로젝트 다운로드

1. GitHub repository 페이지로 이동합니다.
    - https://github.com/hksung/ai-vocab-assistant-tutorial
2. 초록색 **Code** 버튼을 클릭합니다.

3. **Download ZIP**을 선택합니다.

4. 다운로드된 ZIP 파일을 **압축 해제**합니다.

예

```
Downloads
→ ai-vocab-tool-main
```

5. 이 폴더를 Desktop 또는 Documents로 이동합니다.

---

# 3. VS Code에서 프로젝트 열기

1. Visual Studio Code 실행

2. 메뉴에서

```
File → Open Folder
```

3. 다운로드한 프로젝트 폴더 선택

예

```
ai-vocab-tool-main
```

왼쪽에 다음과 같은 폴더가 보이면 정상입니다.

```
backend
frontend
requirements.txt
```

---

# 4. Python 가상환경 만들기

프로젝트마다 Python 환경을 따로 만드는 것이 좋습니다.

VS Code에서 **Terminal**을 엽니다.

```
Terminal → New Terminal
```

### 가상환경 생성

Mac / Linux

```bash
python3 -m venv .venv
```

Windows

```bash
python -m venv .venv
```

---

### 가상환경 활성화

Mac / Linux

```bash
source .venv/bin/activate
```

Windows

```bash
.venv\Scripts\activate
```

성공하면 터미널 앞에 다음과 같은 표시가 나타납니다.

```
(.venv)
```

---

# 5. 필요한 패키지 설치

프로젝트에 필요한 Python 패키지를 설치합니다.

```bash
pip install -r requirements.txt
```

설치에는 몇 분 정도 걸릴 수 있습니다.

---

# 6. 프로젝트 실행

이 프로젝트는 **backend 폴더에서 실행해야 합니다.**

터미널에서 다음을 실행합니다.

```bash
cd backend
```

서버 실행

```bash
uvicorn main:app --reload
```

정상적으로 실행되면 다음 메시지가 나타납니다.

```
Uvicorn running on http://127.0.0.1:8000
```

브라우저에서 다음 주소를 열면 웹 인터페이스가 나타납니다.

```
http://127.0.0.1:8000
```

---

# 7. 프로젝트 파일 구조 이해하기

이 프로젝트에서 중요한 파일은 다음과 같습니다.

```
backend/prompt.py
frontend/main.jsx
frontend/styles.css
frontend/index.html
```

각 파일의 역할

### backend/prompt.py

AI가 어떤 방식으로 글을 분석할지 정의하는 **프롬프트 파일**

---

### frontend/main.jsx

사용자가 보는 **화면 텍스트와 버튼**

---

### frontend/styles.css

웹페이지 **디자인 (색상, 폰트, 버튼 스타일)**

---

### frontend/index.html

웹페이지 **기본 구조와 브라우저 탭 제목**

---

# 8. AI 프롬프트 수정하기

AI가 어떤 방식으로 단어를 제안할지 바꾸려면

```
backend/prompt.py
```

파일을 엽니다.

예시 코드

```python
PROMPT = """
You are a writing assistant helping a learner revise vocabulary in an English essay.
"""
```

`""" """` 사이의 텍스트를 수정하면 됩니다.

예

```python
PROMPT = """
You are a supportive writing assistant helping a student improve vocabulary in an English essay.

The writer is an English learner. Suggest helpful vocabulary alternatives that are clear and natural.
"""
```

주의사항

다음 구조는 삭제하면 안 됩니다.

```
PROMPT =
"""
"""
```

또한 JSON 출력 형식은 그대로 유지하는 것이 좋습니다.

---

# 9. 인터페이스 텍스트 수정하기

사용자가 보는 텍스트는 다음 파일에서 수정합니다.

```
frontend/main.jsx
```

예

기존 코드

```jsx
<h1>English Vocabulary Interface</h1>
```

수정

```jsx
<h1>My Writing Support Tool</h1>
```

또는 버튼 텍스트 수정

```jsx
<button>Next</button>
```

→

```jsx
<button>Start</button>
```

---

# 10. 디자인 수정하기

웹페이지 색상은 다음 파일에서 수정합니다.

```
frontend/styles.css
```

예

기존 코드

```css
button {
  background: #7C878E;
  color: white;
}
```

수정

```css
button {
  background: #2f6f4f;
  color: white;
}
```

수정 가능한 요소

```
body        페이지 배경
button      버튼 색상
.highlight  강조된 단어
.applied    수정된 단어
```

---

# 11. 브라우저 탭 제목 변경

파일

```
frontend/index.html
```

기존

```html
<title>English Vocabulary Interface</title>
```

수정

```html
<title>Writing Support Demo</title>
```

---

# 12. 파일 저장

파일을 수정할 때마다 저장해야 합니다.

Mac

```
Cmd + S
```

Windows

```
Ctrl + S
```

---

# 13. 변경 내용 확인

서버가 실행 중이면

```
http://127.0.0.1:8000
```

을 새로고침하면 변경 내용을 확인할 수 있습니다.

---

# 14. 자주 발생하는 실수

### 폴더 이름 변경

다음 폴더 이름은 변경하지 않습니다.

```
backend
frontend
```

---

### 코드 기호 삭제

다음 기호를 실수로 삭제하면 프로그램이 작동하지 않을 수 있습니다.

```
"
'
{}
[]
,
```

---

### prompt.py 수정 시

다음 구조는 반드시 유지해야 합니다.

```
PROMPT = """
...
"""
```

---

# 15. 간단 요약

가장 기본적인 실행 방법

1. Python 설치
2. VS Code 설치
3. GitHub repository 다운로드
4. VS Code에서 폴더 열기
5. 가상환경 생성

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

6. 서버 실행

```bash
cd backend
uvicorn main:app --reload
```

7. 브라우저에서 실행

```
http://127.0.0.1:8000
```

8. 다음 파일을 수정하면 기능과 디자인을 변경할 수 있습니다.

```
backend/prompt.py
frontend/main.jsx
frontend/styles.css
frontend/index.html
```

```
```
