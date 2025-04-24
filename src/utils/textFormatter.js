// Regular alphabet
const regularAlphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

// Fullwidth (aesthetic) unicode characters
const fullwidthAlphabet = 'ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ０１２３４５６７８９';

// Fancy unicode characters
const fancyAlphabet = 'αвcđєƒgнιjкℓмησρqяsτυvωxуzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

// Emoji alphabet - A-Z only
const emojiSquareAlphabet = {
  'a': '🅰', 'b': '🅱', 'c': '🅲', 'd': '🅳', 'e': '🅴', 'f': '🅵', 'g': '🅶', 'h': '🅷', 'i': '🅸',
  'j': '🅹', 'k': '🅺', 'l': '🅻', 'm': '🅼', 'n': '🅽', 'o': '🅾', 'p': '🅿', 'q': '🆀', 'r': '🆁',
  's': '🆂', 't': '🆃', 'u': '🆄', 'v': '🆅', 'w': '🆆', 'x': '🆇', 'y': '🆈', 'z': '🆉',
  'A': '🅰', 'B': '🅱', 'C': '🅲', 'D': '🅳', 'E': '🅴', 'F': '🅵', 'G': '🅶', 'H': '🅷', 'I': '🅸',
  'J': '🅹', 'K': '🅺', 'L': '🅻', 'M': '🅼', 'N': '🅽', 'O': '🅾', 'P': '🅿', 'Q': '🆀', 'R': '🆁',
  'S': '🆂', 'T': '🆃', 'U': '🆄', 'V': '🆅', 'W': '🆆', 'X': '🆇', 'Y': '🆈', 'Z': '🆉'
};

// Emoji alphabet - circle style
const emojiCircleAlphabet = {
  'a': '🅐', 'b': '🅑', 'c': '🅒', 'd': '🅓', 'e': '🅔', 'f': '🅕', 'g': '🅖', 'h': '🅗', 'i': '🅘',
  'j': '🅙', 'k': '🅚', 'l': '🅛', 'm': '🅜', 'n': '🅝', 'o': '🅞', 'p': '🅟', 'q': '🅠', 'r': '🅡',
  's': '🅢', 't': '🅣', 'u': '🅤', 'v': '🅥', 'w': '🅦', 'x': '🅧', 'y': '🅨', 'z': '🅩',
  'A': '🅐', 'B': '🅑', 'C': '🅒', 'D': '🅓', 'E': '🅔', 'F': '🅕', 'G': '🅖', 'H': '🅗', 'I': '🅘',
  'J': '🅙', 'K': '🅚', 'L': '🅛', 'M': '🅜', 'N': '🅝', 'O': '🅞', 'P': '🅟', 'Q': '🅠', 'R': '🅡',
  'S': '🅢', 'T': '🅣', 'U': '🅤', 'V': '🅥', 'W': '🅦', 'X': '🅧', 'Y': '🅨', 'Z': '🅩'
};

/**
 * Convert text to aesthetic fullwidth characters
 * @param {string} text - Input text
 * @returns {string} Aesthetic text
 */
export function toAesthetic(text) {
  let result = '';
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const index = regularAlphabet.indexOf(char);
    
    if (index !== -1) {
      result += fullwidthAlphabet[index];
    } else {
      // Keep spaces and other characters as they are
      result += char;
    }
  }
  
  return result;
}

/**
 * Convert text to fancy unicode characters
 * @param {string} text - Input text
 * @returns {string} Fancy text
 */
export function toFancy(text) {
  let result = '';
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const index = regularAlphabet.indexOf(char);
    
    if (index !== -1) {
      result += fancyAlphabet[index];
    } else {
      // Keep spaces and other characters as they are
      result += char;
    }
  }
  
  return result;
}

/**
 * Convert text to emoji characters
 * @param {string} text - Input text
 * @param {string} style - Style of emoji (square or circle)
 * @returns {string} Emoji text
 */
export function toEmoji(text, style = 'square') {
  let result = '';
  const alphabet = style === 'circle' ? emojiCircleAlphabet : emojiSquareAlphabet;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    if (alphabet[char]) {
      result += alphabet[char];
    } else if (char === ' ') {
      result += ' ';
    } else {
      // Skip characters that don't have emoji representations
      result += char;
    }
  }
  
  return result;
} 