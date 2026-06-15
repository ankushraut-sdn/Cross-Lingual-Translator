import React, { useState } from 'react';
import './index.css';

export default function App() {
  const [text, setText] = useState("Welcome to your MLOps portfolio.");
  const [targetLang, setTargetLang] = useState("es");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);

  const handleTranslate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/v1/audit/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, target_lang: targetLang })
      });
      const data = await response.json();
      if (data.success) {
        setResult(data.result);
      } else {
        alert("Translation failed: " + data.error);
      }
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Color mapper for heatmap cells (0.0 to 1.0)
  const getCellColor = (val) => {
    // Soft glowing green-blue gradient base
    return `rgba(58, 227, 116, ${val})`;
  };

  return (
    <div className="box" style={{ maxWidth: '1000px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 className="title" style={{ background: 'linear-gradient(135deg, #a6e3a1, #89b4fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Cross-Lingual Translator
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Align and translate textual streams with real-time sequence-to-sequence attention mapping.
        </p>
      </div>

      <div className="panel">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '25px' }}>
          {/* Source Input */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-secondary)' }}>Source Text</label>
            <textarea 
              value={text} 
              onChange={(e) => setText(e.target.value)}
              style={{
                width: '100%',
                height: '120px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '12px',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '1rem',
                resize: 'none',
                outline: 'none'
              }}
              placeholder="Enter text to translate..."
            />
            
            <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
              <div style={{ flex: 1 }}>
                <select 
                  value={targetLang} 
                  onChange={(e) => setTargetLang(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="es" style={{ background: '#111' }}>Spanish (Español)</option>
                  <option value="fr" style={{ background: '#111' }}>French (Français)</option>
                  <option value="de" style={{ background: '#111' }}>German (Deutsch)</option>
                  <option value="hi" style={{ background: '#111' }}>Hindi (हिन्दी)</option>
                </select>
              </div>
              <button 
                className="btn" 
                onClick={handleTranslate} 
                disabled={loading || !text}
                style={{ flex: 1, padding: '12px', margin: 0 }}
              >
                {loading ? 'Translating...' : 'Translate Seq2Seq →'}
              </button>
            </div>
          </div>

          {/* Translation Output */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-secondary)' }}>Translation Output</label>
            <div style={{
              flex: 1,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '15px',
              color: result ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '120px',
              fontStyle: result ? 'normal' : 'italic'
            }}>
              {result ? result.translated_text : "Translated output will appear here..."}
            </div>

            {result && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '15px' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Latency</div>
                  <strong style={{ color: '#89b4fa' }}>{result.metrics.translation_latency_ms} ms</strong>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Perplexity</div>
                  <strong style={{ color: '#a6e3a1' }}>{result.metrics.perplexity}</strong>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tokens (S/T)</div>
                  <strong>{result.metrics.source_token_count} / {result.metrics.target_token_count}</strong>
                </div>
              </div>
            )}
          </div>
        </div>

        {loading && <div className="spinner"></div>}

        {result && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '25px', marginTop: '20px' }}>
            <h3 style={{ color: '#89b4fa', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🎛️</span> Cross-Attention Heatmap Alignments
            </h3>

            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
              {/* Heatmap Grid */}
              <div style={{ overflowX: 'auto', flex: 1, paddingBottom: '10px' }}>
                <div style={{ display: 'inline-block', position: 'relative' }}>
                  {/* Grid Header Source Tokens */}
                  <div style={{ display: 'flex', marginLeft: '120px', marginBottom: '10px' }}>
                    {result.source_tokens.map((token, j) => (
                      <div 
                        key={j} 
                        style={{ 
                          width: '50px', 
                          textAlign: 'center', 
                          fontSize: '0.8rem', 
                          fontWeight: 'bold', 
                          color: 'var(--text-secondary)',
                          whiteSpace: 'nowrap',
                          transform: 'rotate(-45deg)',
                          transformOrigin: 'bottom center',
                          height: '40px',
                          display: 'flex',
                          alignItems: 'flex-end',
                          justifyContent: 'center'
                        }}
                      >
                        {token}
                      </div>
                    ))}
                  </div>

                  {/* Grid Rows for Target Tokens */}
                  {result.target_tokens.map((targetToken, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: '120px', textAlign: 'right', paddingRight: '15px', fontSize: '0.85rem', fontWeight: 'bold', color: '#cba6f7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {targetToken}
                      </div>
                      
                      {result.source_tokens.map((sourceToken, j) => {
                        const weight = result.attention_weights[i][j];
                        return (
                          <div 
                            key={j} 
                            onMouseEnter={() => setHoveredCell({ i, j, sourceToken, targetToken, weight })}
                            onMouseLeave={() => setHoveredCell(null)}
                            style={{ 
                              width: '50px', 
                              height: '50px', 
                              background: getCellColor(weight),
                              margin: '2px', 
                              borderRadius: '4px',
                              border: '1px solid rgba(255,255,255,0.05)',
                              cursor: 'pointer',
                              transition: 'transform 0.15s ease',
                              transform: hoveredCell?.i === i && hoveredCell?.j === j ? 'scale(1.15)' : 'none',
                              boxShadow: hoveredCell?.i === i && hoveredCell?.j === j ? '0 0 10px rgba(58, 227, 116, 0.6)' : 'none',
                              zIndex: hoveredCell?.i === i && hoveredCell?.j === j ? 10 : 1
                            }}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tooltip & Legend Card */}
              <div style={{ width: '260px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '15px' }}>
                <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em' }}>Inspector Details</h4>
                {hoveredCell ? (
                  <div>
                    <div style={{ marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Source Token:</span>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#89b4fa' }}>"{hoveredCell.sourceToken}"</div>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Target Token:</span>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#cba6f7' }}>"{hoveredCell.targetToken}"</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Attention Alignment:</span>
                      <div style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#a6e3a1' }}>{(hoveredCell.weight * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                    Hover over cells inside the cross-attention alignment grid to inspect model weights.
                  </p>
                )}

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '15px', paddingTop: '15px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Weight Scale</div>
                  <div style={{ height: '8px', width: '100%', background: 'linear-gradient(90deg, rgba(58, 227, 116, 0.0) 0%, rgba(58, 227, 116, 1.0) 100%)', borderRadius: '4px', marginBottom: '4px' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span>0.0 (None)</span>
                    <span>1.0 (Max)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}