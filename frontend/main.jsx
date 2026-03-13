const { useState } = React;

/* 
Home Page Component
- Page title and text description
- Collects participant's name 
*/
function HomePage({ firstName, lastName, setFirstName, setLastName, goNext }) {
  return (
    <div className="centered">
      <h1>English Vocabulary Interface (Tutorial)</h1>

      <p>
        이 인터페이스는 영어 글쓰기에서 선택된 일부 단어에 대해 여러 가능한 단어 옵션을 보여줍니다. 문장을 입력하면 글 속의 일부 단어에 대해 여러 단어 옵션이 표시됩니다. This interface displays alternative word options for selected words in an
        English text. After you enter your text, some words will appear with several possible word options.
      </p>


      <p>
        실험을 시작하려면 이름과 성을 입력해 주세요.
        <br />
        Please enter your first and last name to begin.
      </p>

      <input
        type="text"
        placeholder="이름 / First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />

      <input
        type="text"
        placeholder="성 / Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />

      <button onClick={goNext} disabled={!firstName || !lastName}>
        다음 / Next
      </button>
    </div>
  );
}

/* 
Essay Page Component
- Page header and prompt
- Handles the input of the essay
- Controls the word maximum
*/
function EssayPage({ essay, setEssay, analyze, loading, error }) {
  const MAX_WORDS = 200;

  function countWords(text) {
    return text.trim().split(/\s+/).filter((word) => word.length > 0).length;
  }

  function handleChange(e) {
    const text = e.target.value;
    const words = text.trim().split(/\s+/);

    if (countWords(text) <= MAX_WORDS) {
      setEssay(text);
    } else {
      const trimmed = words.slice(0, MAX_WORDS).join(" ");
      setEssay(trimmed + " ");
    }
  }

  const wordCount = countWords(essay);

return (
  <div>
    <h2>
      20분 동안 150–200단어로 에세이를 작성해 주세요.
      <br />
      Please write a 150–200 word essay within 20 minutes.
    </h2>

      <div className="textarea-container">
        <textarea
          value={essay}
          onChange={handleChange}
          placeholder="여기에 에세이를 작성해 주세요. / Write your essay here."
        />
        <div className={`word-counter ${wordCount === MAX_WORDS ? "limit" : ""}`}>
          {wordCount} / {MAX_WORDS} 단어 words
        </div>
      </div>

      <button onClick={analyze} disabled={loading}>
        {loading ? "Submitting... / 제출 중..." : "Submit Essay / 에세이 제출"}
      </button>

      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}

/* 
Vocabulary Page Component
- Page Header
- Renders the text to display the proposed word choices
*/
function VocabularyPage({ renderText, submitSession }) {
  return (
    <div>
      <h2>단어 옵션 확인 / Word options</h2>

      <p>
        표시된 단어를 순서대로 모두 클릭하여 가능한 단어 옵션을 확인해 주세요.
        각 단어에 대해 원하는 옵션을 선택하거나 기존 단어를 그대로 유지할 수 있습니다.
      </p>

      <p>
        Please click all highlighted words in order to view the available word options.
        For each word, you may select a different option or keep the original word.
      </p>

      <div className="text">{renderText()}</div>

      <button onClick={submitSession}>
        변경 사항 제출 / Submit changes
      </button>
    </div>
  );
}

/* "Thank You" Page Component
- Final message to user
*/
function ThankYouPage({ goHome }) {
  return (
    <div className="centered">
      <h2>
        참여해 주셔서 감사합니다.
        <br />
        Thank you for participating.
      </h2>

      <p>
        응답이 저장되었습니다.
        <br />
        Your responses have been recorded.
      </p>

      <button onClick={goHome}>
        처음으로 / Home
      </button>
    </div>
  );
}

/* Main Application Component
- Controls the page navigation and setup
- Controls the session state
*/
function App() {
  const [page, setPage] = useState("home");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [essay, setEssay] = useState("");
  const [displayText, setDisplayText] = useState("");
  const [edits, setEdits] = useState([]);
  const [activeEditId, setActiveEditId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sessionEdits, setSessionEdits] = useState({});

  const popupRef = React.useRef(null);

  function analyze() {
    setError(null);
    setLoading(true);

    setEdits([]);
    setDisplayText("");
    setActiveEditId(null);

    fetch("/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ essay })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Server error");
        return res.json();
      })
      .then((data) => {
        setLoading(false);
        if (data.error) {
          setError(data.error);
          return;
        }

        if (!Array.isArray(data.edits)) {
          setError("Invalid response from server.");
          return;
        }

        let searchStart = 0;
        const editsWithIds = data.edits
          .map((e, i) => {
            const start = essay.indexOf(e.original, searchStart);
            if (start === -1) return null;

            searchStart = start + e.original.length;

            return {
              ...e,
              id: `edit-${i}`,
              start,
              end: start + e.original.length,
              appliedText: e.original
            };
          })
          .filter(Boolean);

        setEdits(editsWithIds);
        setPage("vocab");
        setDisplayText(essay);
        setActiveEditId(null);
      })
      .catch((err) => {
        setLoading(false);
        console.error(err);
        setError("Something went wrong while analyzing the essay.");
      });
  }

  function applyEdit(editId, replacementText, choiceIndex = 0) {
    const edit = edits.find((e) => e.id === editId);

    setSessionEdits((prev) => {
      const { precedingWord, followingWord } = getContextWords(
        displayText,
        edit.start,
        edit.end
      );

      return {
        ...prev,
        [editId]: {
          editId,
          original: edit.original,
          final: replacementText,
          choiceIndex,
          precedingWord,
          followingWord,
          timestamp: new Date().toISOString()
        }
      };
    });

    setDisplayText((prev) => {
      const edit = edits.find((e) => e.id === editId);

      return prev.slice(0, edit.start) + replacementText + prev.slice(edit.end);
    });

    setEdits((prev) => {
      const current = prev.find((e) => e.id === editId);
      const oldLength = current.end - current.start;
      const newLength = replacementText.length;
      const delta = newLength - oldLength;

      return prev.map((e) => {
        if (e.id === editId) {
          return {
            ...e,
            appliedText: replacementText,
            end: e.start + newLength
          };
        }

        if (e.start > current.start) {
          return {
            ...e,
            start: e.start + delta,
            end: e.end + delta
          };
        }

        return e;
      });
    });

    setActiveEditId(null);
  }

  function renderText() {
    let cursor = 0;
    const elements = [];

    edits.forEach((edit) => {
      elements.push(displayText.slice(cursor, edit.start));

      elements.push(
        <span
          key={edit.id}
          className={edit.appliedText !== edit.original ? "applied" : "highlight"}
          onClick={(e) => {
            e.stopPropagation();
            setActiveEditId(edit.id);
          }}
        >
          {displayText.slice(edit.start, edit.end)}

          {activeEditId === edit.id && (
            <div
              className="popup"
              ref={popupRef}
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => applyEdit(edit.id, edit.original, 0)}>
                변경 없음 / No change
              </button>

              {edit.options.map((o, index) => (
                <button
                  key={o.level}
                  onClick={() => applyEdit(edit.id, o.text, index + 1)}
                >
                  {o.text}
                </button>
              ))}
            </div>
          )}
        </span>
      );

      cursor = edit.end;
    });

    elements.push(displayText.slice(cursor));
    return elements;
  }

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setActiveEditId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function getContextWords(text, start, end) {
    const beforeText = text.slice(0, start).trim();
    const afterText = text.slice(end).trim();

    const beforeWords = beforeText.split(/\s+/);
    const afterWords = afterText.split(/\s+/);

    return {
      precedingWord:
        beforeWords.length > 0 ? beforeWords[beforeWords.length - 1] : null,
      followingWord: afterWords.length > 0 ? afterWords[0] : null
    };
  }

  function submitSession() {
    const payload = {
      firstName,
      lastName,
      originalEssay: essay,
      finalEssay: displayText,
      edits: Object.values(sessionEdits)
    };

    fetch("/store-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(() => {
        setPage("thankyou");
        setFirstName("");
        setLastName("");
        setEssay("");
        setDisplayText("");
        setEdits([]);
        setSessionEdits({});
      })
      .catch(() => alert("Failed to save session. / 저장에 실패했습니다."));
  }

  return (
    <div>
      {page === "home" && (
        <HomePage
          firstName={firstName}
          lastName={lastName}
          setFirstName={setFirstName}
          setLastName={setLastName}
          goNext={() => setPage("essay")}
        />
      )}

      {page === "essay" && (
        <EssayPage
          essay={essay}
          setEssay={setEssay}
          analyze={analyze}
          loading={loading}
          error={error}
        />
      )}

      {page === "vocab" && (
        <VocabularyPage
          renderText={renderText}
          submitSession={submitSession}
        />
      )}

      {page === "thankyou" && (
        <ThankYouPage
          goHome={() => {
            setPage("home");
            setEssay("");
            setDisplayText("");
            setEdits([]);
            setFirstName("");
            setLastName("");
            localStorage.removeItem("fullSession");
            setSessionEdits({});
          }}
        />
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);