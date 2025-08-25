import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import './App.css';

const themes = [
  { name: 'Ocean', color: '#007bff' },
  { name: 'Forest', color: '#28a745' },
  { name: 'Sunset', color: '#fd7e14' },
  { name: 'Purple', color: '#6f42c1' },
  { name: 'Rose', color: '#e83e8c' },
  { name: 'Mint', color: '#20c997' },
];

const App: React.FC = () => {
  const [activeTheme, setActiveTheme] = useState('Ocean');
  const [gridData, setGridData] = useState<string[]>(Array(81).fill(''));
  const gridRef = useRef<HTMLDivElement>(null);

  const darkenColor = (hex: string, percent: number) => {
    hex = hex.replace('#', '');
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    r = Math.floor(r * (100 - percent) / 100);
    g = Math.floor(g * (100 - percent) / 100);
    b = Math.floor(b * (100 - percent) / 100);

    r = (r < 0) ? 0 : r;
    g = (g < 0) ? 0 : g;
    b = (b < 0) ? 0 : b;

    const rHex = r.toString(16).padStart(2, '0');
    const gHex = g.toString(16).padStart(2, '0');
    const bHex = b.toString(16).padStart(2, '0');

    return `#${rHex}${gHex}${bHex}`;
  };

  const handleCellChange = (index: number, value: string) => {
    const newGridData = [...gridData];
    newGridData[index] = value;
    setGridData(newGridData);
  };

  const handleExport = () => {
    if (gridRef.current) {
      html2canvas(gridRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        onclone: (clonedDoc: Document) => {
          const clonedGrid = clonedDoc.querySelector('.interactive-grid');
          if (clonedGrid) {
            const textareas = clonedGrid.querySelectorAll('textarea');
            textareas.forEach((textarea: HTMLTextAreaElement) => {
              const div = clonedDoc.createElement('div');
              const computedStyle = window.getComputedStyle(textarea);

              div.className = textarea.className;
              div.innerText = textarea.value;

              // Copy essential styles explicitly
              div.style.width = computedStyle.width;
              div.style.height = computedStyle.height;
              div.style.padding = computedStyle.padding;
              div.style.border = computedStyle.border;
              div.style.fontFamily = computedStyle.fontFamily;
              div.style.fontSize = computedStyle.fontSize;
              div.style.fontWeight = computedStyle.fontWeight; // Fix: Added fontWeight
              div.style.color = computedStyle.color;
              div.style.textAlign = computedStyle.textAlign;
              div.style.boxSizing = computedStyle.boxSizing;

              // Crucial styles for text wrapping and alignment
              div.style.whiteSpace = 'pre-wrap';
              div.style.wordWrap = 'break-word';
              div.style.display = 'flex';
              div.style.justifyContent = 'center';
              div.style.alignItems = 'center';

              // Handle background color: use inline style if it exists, otherwise default to white
              if (textarea.style.backgroundColor) {
                div.style.backgroundColor = textarea.style.backgroundColor;
              } else {
                div.style.backgroundColor = '#ffffff';
              }

              textarea.parentNode?.replaceChild(div, textarea);
            });
          }
        }
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'mandala-chart.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      }).catch(err => {
        console.error('Export failed:', err);
      });
    }
  };

  const currentTheme = themes.find(theme => theme.name === activeTheme) || themes[0];
  const themeColorCellIndices = [4, 13, 22, 31, 49, 58, 67, 76];

  const renderGrid = () => {
    const cells = [];
    for (let i = 0; i < 81; i++) {
      const majorCellIndex = Math.floor(i / 9);
      const isCoreGoal = majorCellIndex === 4 && (i % 9) === 4;
      const isThemeColorCell = themeColorCellIndices.includes(i);

      const style: React.CSSProperties = {};
      if (isCoreGoal) {
        style.backgroundColor = darkenColor(currentTheme.color, 40);
        style.color = 'white';
      } else if (isThemeColorCell) {
        style.backgroundColor = currentTheme.color;
      }

      cells.push(
        <textarea
          key={i}
          className={`minor-cell ${isCoreGoal ? 'core-goal' : ''}`}
          value={gridData[i]}
          onChange={(e) => handleCellChange(i, e.target.value)}
          placeholder={isCoreGoal ? 'Core Goal' : ''}
          style={style}
          aria-label={`Grid Cell ${i + 1}`}
        />
      );
    }

    const majorCells = [];
    for (let i = 0; i < 9; i++) {
      majorCells.push(
        <div key={i} className="major-cell" style={{ borderColor: currentTheme.color }}>
          {cells.slice(i * 9, i * 9 + 9)}
        </div>
      );
    }
    return majorCells;
  };

  return (
    <div className="App">
      <main className="main-content">
        <aside className="sidebar">
          <h1 className="header-title">Mandala.io</h1>
          <div className="theme-selector">
            <h3>Choose Your Theme</h3>
            <div className="theme-buttons">
              {themes.map(theme => (
                <button 
                  key={theme.name} 
                  className={`theme-button ${activeTheme === theme.name ? 'active' : ''}`}
                  onClick={() => setActiveTheme(theme.name)}
                >
                  <span className="theme-color" style={{ backgroundColor: theme.color }}></span>
                  {theme.name}
                </button>
              ))}
            </div>
          </div>
          <div className="export-section">
            <button className="export-button" onClick={handleExport}>Export as Image</button>
          </div>
        </aside>
        <section className="grid-container">
          <div className="interactive-grid" style={{ borderColor: currentTheme.color }} ref={gridRef}>
            {renderGrid()}
          </div>
          <div className="grid-footer">
            <p>Click any cell to start planning. The center cell is your core goal.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;