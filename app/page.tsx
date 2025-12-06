"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Type,
  Zap,
  BookOpen,
  Settings,
} from "lucide-react";

const Home = () => {
  // --- State ---
  const [inputText, setInputText] = useState(
    "Welcome to SpeedRead Pro! \n\nPaste your own text here to get started. \n\nSpeed reading technologies like this one allow you to read faster by eliminating the need for your eyes to move across the page (saccadic movements). \n\nInstead, the words are flashed in the same position, centering on the 'Optimal Recognition Point'—usually the middle character—highlighted in red. \n\nTry adjusting the Words Per Minute (WPM) slider below. Most people can comfortably read at 400-600 WPM with a little practice. \n\nReady? Press Play!",
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(300);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showInput, setShowInput] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [fontSize, setFontSize] = useState(24); // px

  // --- Derived State ---
  // Split by whitespace but keep integrity of words. Remove empty strings.
  const words = useMemo(() => {
    return inputText
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0);
  }, [inputText]);

  const currentWord = words[currentIndex] || "";
  const totalWords = words.length;

  // --- Logic: Word Processing ---
  // Identify the pivot character (Optimal Recognition Point)
  const getWordParts = (word: string) => {
    if (!word) return { left: "", middle: "", right: "" };

    // Logic to find the "middle" or best pivot point
    // Usually slightly to the left of true center for long words, but center is fine for general use.
    const pivotIndex = Math.ceil((word.length - 1) / 2);

    const left = word.slice(0, pivotIndex);
    const middle = word[pivotIndex];
    const right = word.slice(pivotIndex + 1);

    return { left, middle, right };
  };

  const { left, middle, right } = getWordParts(currentWord);

  // --- Logic: Timing Loop ---
  useEffect(() => {
    let interval = null;

    if (isPlaying && currentIndex < totalWords) {
      // Calculate delay in ms.
      // 60000 ms in a minute / WPM = ms per word
      const baseDelay = 60000 / wpm;

      // Dynamic delay adjustment (Optional advanced feature):
      // Add slight pause for punctuation to make it feel more natural.
      let delay = baseDelay;
      if (currentWord.match(/[.,;!?]$/)) delay = baseDelay * 1.5; // Slow down on punctuation
      if (currentWord.length > 10) delay = baseDelay * 1.2; // Slow down on long words

      interval = setTimeout(() => {
        setCurrentIndex((prev) => {
          if (prev + 1 >= totalWords) {
            setIsPlaying(false);
            return prev; // Stop at end
          }
          return prev + 1;
        });
      }, delay);
    }

    if (interval) return () => clearTimeout(interval);
  }, [isPlaying, currentIndex, wpm, totalWords, currentWord]);

  // --- Handlers ---
  const togglePlay = () => {
    if (currentIndex >= totalWords - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === "Space" && !showInput) {
      e.preventDefault(); // Prevent scrolling
      togglePlay();
    }
  };

  // Add keyboard listener for spacebar when in reading mode
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showInput, isPlaying, currentIndex, totalWords]);

  // --- UI Components ---

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${darkMode ? "bg-slate-900 text-slate-100" : "bg-gray-50 text-gray-900"}`}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-opacity-10 border-current shadow-sm z-10">
        <div className="flex items-center space-x-2">
          <Zap className="w-6 h-6 text-yellow-500" fill="currentColor" />
          <h1 className="text-xl font-bold tracking-tight">
            SpeedRead<span className="text-blue-500">Pro</span>
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full hover:bg-opacity-20 hover:bg-gray-500 transition`}
            title="Toggle Theme"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-8">
        {/* View Toggle (Edit vs Read) */}
        <div className="flex bg-slate-200/20 rounded-lg p-1">
          <button
            onClick={() => {
              setShowInput(true);
              setIsPlaying(false);
            }}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${showInput ? (darkMode ? "bg-slate-700 shadow" : "bg-white shadow") : "opacity-60 hover:opacity-100"}`}
          >
            <Type className="w-4 h-4 mr-2" />
            Editor
          </button>
          <button
            onClick={() => setShowInput(false)}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${!showInput ? (darkMode ? "bg-slate-700 shadow" : "bg-white shadow") : "opacity-60 hover:opacity-100"}`}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Reader
          </button>
        </div>

        {/* INPUT MODE */}
        {showInput ? (
          <div className="w-full h-full flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div
              className={`relative w-full rounded-xl shadow-inner border transition-all ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}
            >
              <textarea
                className="w-full h-96 p-6 bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-xl"
                placeholder="Paste your text here..."
                value={inputText}
                onChange={handleTextChange}
                style={{ fontSize: "1.1rem", lineHeight: "1.6" }}
              />
              <div className="absolute bottom-4 right-4 text-xs opacity-50">
                {words.length} words
              </div>
            </div>
            <button
              onClick={() => setShowInput(false)}
              className="self-center bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105 active:scale-95"
            >
              Start Reading
            </button>
          </div>
        ) : (
          /* READER MODE */
          <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
            {/* The Stage */}
            <div
              className={`relative w-full max-w-2xl aspect-[16/9] sm:aspect-[21/9] flex items-center justify-center rounded-2xl shadow-2xl mb-8 border-4 overflow-hidden transition-colors ${
                darkMode
                  ? "bg-slate-800 border-slate-700"
                  : "bg-white border-gray-200"
              }`}
            >
              {/* ORP Guides (The notches) */}
              <div className="absolute top-0 bottom-0 left-1/2 w-px -ml-[0.5px] opacity-10 bg-current"></div>
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-red-500/50 rounded-full"></div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-red-500/50 rounded-full"></div>

              {/* The Word Display */}
              <div
                className="flex items-baseline w-full px-8 select-none"
                style={{ fontSize: `${fontSize}px` }}
              >
                {/* Left side: Aligned right, takes up 50% - width of middle char */}
                <div className="flex-1 text-right whitespace-nowrap overflow-hidden text-current opacity-80 font-mono">
                  {left}
                </div>

                {/* Middle (Pivot): Centered red character */}
                <div className="text-center font-bold text-red-500 mx-0.5 w-[1ch] shrink-0 font-mono">
                  {middle}
                </div>

                {/* Right side: Aligned left */}
                <div className="flex-1 text-left whitespace-nowrap overflow-hidden text-current opacity-80 font-mono">
                  {right}
                </div>
              </div>

              {/* Context Preview (Optional - Ghost text below) */}
              {currentIndex < totalWords - 1 && (
                <div className="absolute bottom-6 text-xs opacity-20 font-mono pointer-events-none">
                  Next: {words[currentIndex + 1]}
                </div>
              )}
            </div>

            {/* Controls Dashboard */}
            <div
              className={`w-full max-w-2xl rounded-2xl p-6 shadow-lg border backdrop-blur-sm ${darkMode ? "bg-slate-800/80 border-slate-700" : "bg-white/80 border-gray-200"}`}
            >
              {/* Progress Slider */}
              <div className="mb-6">
                <div className="flex justify-between text-xs font-medium opacity-50 mb-2">
                  <span>
                    {currentIndex} / {totalWords} words
                  </span>
                  <span>{Math.round((currentIndex / totalWords) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={totalWords - 1}
                  value={currentIndex}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setCurrentIndex(parseInt(e.target.value));
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 dark:bg-gray-700"
                />
              </div>

              {/* Main Controls Row */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                {/* Playback Buttons */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleReset}
                    className="p-3 rounded-full hover:bg-gray-500/10 transition-colors"
                    title="Reset to Start"
                  >
                    <RotateCcw className="w-5 h-5 opacity-70" />
                  </button>

                  <button
                    onClick={togglePlay}
                    className={`p-4 rounded-full shadow-lg shadow-blue-500/20 transition-all transform hover:scale-105 active:scale-95 ${
                      isPlaying
                        ? "bg-amber-500 hover:bg-amber-400 text-white"
                        : "bg-blue-600 hover:bg-blue-500 text-white"
                    }`}
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 fill-current" />
                    ) : (
                      <Play className="w-8 h-8 fill-current ml-1" />
                    )}
                  </button>
                </div>

                {/* Speed Controls */}
                <div className="flex-1 w-full sm:w-auto">
                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold flex items-center gap-2">
                        <Settings className="w-4 h-4" /> Speed
                      </label>
                      <span className="text-xl font-bold text-blue-500 font-mono">
                        {wpm}{" "}
                        <span className="text-xs text-gray-400 font-sans">
                          WPM
                        </span>
                      </span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="1500"
                      step="10"
                      value={wpm}
                      onChange={(e) => setWpm(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 dark:bg-gray-700"
                    />
                    <div className="flex justify-between text-xs opacity-40">
                      <span>60 (Slow)</span>
                      <span>1500 (Pro)</span>
                    </div>
                  </div>
                </div>

                {/* Font Size */}
                <div className="hidden sm:block border-l pl-6 border-gray-500/20">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-semibold mb-2 opacity-70">
                      Size
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setFontSize(Math.max(16, fontSize - 4))}
                        className="w-8 h-8 rounded hover:bg-gray-500/20 text-sm font-bold"
                      >
                        -
                      </button>
                      <span className="text-sm w-4 text-center">
                        {fontSize}
                      </span>
                      <button
                        onClick={() => setFontSize(Math.min(96, fontSize + 4))}
                        className="w-8 h-8 rounded hover:bg-gray-500/20 text-sm font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-8 text-sm opacity-50 max-w-md text-center">
              Tip: Press{" "}
              <kbd className="font-mono bg-gray-500/20 px-1 rounded">
                Spacebar
              </kbd>{" "}
              to play/pause. Focus your eyes on the{" "}
              <span className="text-red-500">red letter</span> and try not to
              blink too often.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
