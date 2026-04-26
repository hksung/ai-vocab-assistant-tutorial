const { useState } = React;

/* 
Home Page Component
- Page title and text description
- Collects participant's name 
*/
function HomePage({ firstName, lastName, setFirstName, setLastName, goNext }) {
  return (
    <div className="centered">
      <h1>EnglishEdu AI Assistant Web App Interface (Tutorial)</h1>
      <p>
        Please enter your first and last name to begin.
      </p>

      <input
        type="text"
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />

      <input
        type="text"
        placeholder="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />

      <button onClick={goNext} disabled={!firstName || !lastName}>
        Next
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
  <div className={loading ? "highlight-all" : ""}>
    <h2>
      Please write a 150–200 word essay within 20 minutes.
    </h2>

      <div className="textarea-container">
        <textarea
          value={essay}
          onChange={handleChange}
          placeholder="Write your essay here."
        />
        <div className={`word-counter ${wordCount === MAX_WORDS ? "limit" : ""}`}>
          {wordCount} / {MAX_WORDS} words
        </div>
      </div>

      <button onClick={analyze} disabled={loading}>
        {loading ? "Submitting... " : "Submit Essay "}
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
      <h2>AI Revised Text</h2>
      <p>
        Review the AI's suggested revisions. Click on highlighted words and phrases to see alternative options.
        Vocabulary suggestions are shown in yellow and grammar suggestions are shown in blue.
        You can select a different option or keep the original text.
      </p>

      <div className="text">{renderText()}</div>

      <button onClick={submitSession}>
        Submit changes
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
      Thank you for participating.
      </h2>

      <p>
      Your responses have been recorded.
      </p>

      <button onClick={goHome}>
        Home
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
        const editsWithPositions = data.edits
          .map((e, i) => {
            // Try exact match first
            let start = essay.indexOf(e.original, 0);
            
            // If not found, try flexible whitespace matching
            if (start === -1) {
              const pattern = e.original.replace(/\s+/g, '\\s+');
              const regex = new RegExp(pattern, 'i');  // Case-insensitive
              const match = essay.match(regex);
              
              if (match) {
                start = match.index;
              }
            }
            
            return start !== -1 ? { edit: e, start, index: i } : null;
          })
          .filter(Boolean)
          .sort((a, b) => a.start - b.start);  // Sort by position

        const filteredEdits = [];
        editsWithPositions.forEach(({ edit, start, index }) => {
          const end = start + edit.original.length;
          const overlapIndex = filteredEdits.findIndex((accepted) =>
            start < accepted.end && accepted.start < end
          );

          if (overlapIndex === -1) {
            filteredEdits.push({ edit, start, end, index });
            return;
          }

          const accepted = filteredEdits[overlapIndex];

          if (edit.type === 'grammar' && accepted.edit.type === 'vocabulary') {
            edit.secondary = {
              ...accepted.edit,
              start: accepted.start,
              end: accepted.end,
              id: `edit-${accepted.index}`
            };
            filteredEdits[overlapIndex] = { edit, start, end, index };
          } else if (edit.type === 'vocabulary' && accepted.edit.type === 'grammar') {
            accepted.edit.secondary = {
              ...edit,
              start,
              end,
              id: `edit-${index}`
            };
            filteredEdits[overlapIndex] = accepted;
          }
          // If both are same type or accepted is grammar, keep accepted
        });

        console.log('Received edits:', data.edits);
        console.log('Edits with positions:', editsWithPositions);
        console.log('Filtered overlapping edits:', filteredEdits);

        const editsWithIds = filteredEdits.map(({ edit, start, end, index }) => ({
          ...edit,
          id: `edit-${index}`,
          start,
          end,
          appliedText: edit.original
        }));

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

  function applySecondaryEdit(editId, replacementText) {
    const parentEdit = edits.find((e) => e.id === editId);
    if (!parentEdit || !parentEdit.secondary) {
      return;
    }

    const secondary = parentEdit.secondary;
    const parentText = displayText.slice(parentEdit.start, parentEdit.end);
    const pattern = secondary.original.replace(/\s+/g, '\\s+');
    const regex = new RegExp(pattern, 'i');
    const match = parentText.match(regex);
    if (!match) {
      return;
    }

    const subStart = parentEdit.start + match.index;
    const subEnd = subStart + match[0].length;
    const delta = replacementText.length - (subEnd - subStart);

    setDisplayText((prev) => prev.slice(0, subStart) + replacementText + prev.slice(subEnd));

    setEdits((prev) =>
      prev.map((e) => {
        if (e.id === editId) {
          return {
            ...e,
            secondaryApplied: {
              start: subStart,
              end: subStart + replacementText.length,
              original: secondary.original,
              appliedText: replacementText
            },
            end: e.end + delta
          };
        }

        if (e.start > subStart) {
          return {
            ...e,
            start: e.start + delta,
            end: e.end + delta
          };
        }

        return e;
      })
    );
  }

  function renderText() {
    let cursor = 0;
    const elements = [];

    edits.forEach((edit) => {
      elements.push(displayText.slice(cursor, edit.start));

      elements.push(
        <span
          key={edit.id}
          className={edit.appliedText !== edit.original ? `applied-${edit.type}` : `highlight-${edit.type}`}
          onClick={(e) => {
            e.stopPropagation();
            setActiveEditId(edit.id);
          }}
        >
          {edit.secondaryApplied && edit.secondaryApplied.start >= edit.start && edit.secondaryApplied.end <= edit.end ? (
            <>
              {displayText.slice(edit.start, edit.secondaryApplied.start)}
              <span className="highlight-vocabulary">
                {displayText.slice(edit.secondaryApplied.start, edit.secondaryApplied.end)}
              </span>
              {displayText.slice(edit.secondaryApplied.end, edit.end)}
            </>
          ) : (
            displayText.slice(edit.start, edit.end)
          )}

          {activeEditId === edit.id && (
            <div
              className="popup"
              ref={popupRef}
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => applyEdit(edit.id, edit.original, 0)}>
                No change
              </button>

              {edit.options.map((o, index) => (
                <div key={o.level}>
                  <button onClick={() => applyEdit(edit.id, o.text, index + 1)}>
                    {o.text}
                  </button>
                  {edit.type === "grammar" && edit.explanation && (
                    <div className="explanation">{edit.explanation}</div>
                  )}
                </div>
              ))}

              {edit.secondary && edit.secondary.type === "vocabulary" && (
                <div className="secondary-note">
                  <div className="secondary-label">
                    Grammar is applied first here. Vocabulary alternatives are also available.
                  </div>
                  {edit.secondary.options.map((o, index) => (
                    <button
                      key={o.level}
                      className="secondary-button"
                      onClick={() => applySecondaryEdit(edit.id, o.text)}
                    >
                      {o.text}
                    </button>
                  ))}
                </div>
              )}
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