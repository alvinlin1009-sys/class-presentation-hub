/**
 * Lightweight, dependency-free QR Code SVG generator (Byte mode, ECC Level L/M)
 * Supports URLs up to ~150 bytes (Versions 1 to 6).
 */
(function (global) {
  // GF(256) math for Reed-Solomon
  const EXP = new Uint8Array(512);
  const LOG = new Uint8Array(256);
  (function initGF() {
    let x = 1;
    for (let i = 0; i < 255; i++) {
      EXP[i] = x;
      LOG[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11d;
    }
    for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  })();

  function gfMul(a, b) {
    return a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]];
  }

  function rsGeneratorPoly(degree) {
    let poly = [1];
    for (let i = 0; i < degree; i++) {
      const next = new Array(poly.length + 1).fill(0);
      const root = EXP[i];
      for (let j = 0; j < poly.length; j++) {
        next[j] ^= poly[j];
        next[j + 1] ^= gfMul(poly[j], root);
      }
      poly = next;
    }
    return poly;
  }

  function rsEncode(data, ecLen) {
    const gen = rsGeneratorPoly(ecLen);
    const msg = new Uint8Array(data.length + ecLen);
    msg.set(data, 0);
    for (let i = 0; i < data.length; i++) {
      const coef = msg[i];
      if (coef !== 0) {
        for (let j = 0; j < gen.length; j++) {
          msg[i + j] ^= gfMul(gen[j], coef);
        }
      }
    }
    return msg.slice(data.length);
  }

  // Version table for ECC Level L (1..6): [totalDataCodewords, ecCodewordsPerBlock, numBlocks, alignmentPatternCenters]
  const VERSION_TABLE = [
    null,
    { dataBytes: 19, ecBytes: 7, blocks: 1, align: [] },
    { dataBytes: 34, ecBytes: 10, blocks: 1, align: [6, 18] },
    { dataBytes: 55, ecBytes: 15, blocks: 1, align: [6, 22] },
    { dataBytes: 80, ecBytes: 20, blocks: 1, align: [6, 26] },
    { dataBytes: 108, ecBytes: 26, blocks: 1, align: [6, 30] },
    { dataBytes: 136, ecBytes: 18, blocks: 2, align: [6, 34] }
  ];

  function encodeUTF8(str) {
    return new TextEncoder().encode(str);
  }

  function selectVersion(byteLen) {
    for (let v = 1; v <= 6; v++) {
      // 4 bits mode + 8 bits length + 4 bits terminator = 2 bytes overhead
      if (byteLen + 2 <= VERSION_TABLE[v].dataBytes) return v;
    }
    return 6;
  }

  function createCodewords(text) {
    const bytes = encodeUTF8(text);
    const version = selectVersion(bytes.length);
    const info = VERSION_TABLE[version];
    const totalBits = info.dataBytes * 8;
    const bits = [];

    function pushBits(val, len) {
      for (let i = len - 1; i >= 0; i--) {
        bits.push((val >>> i) & 1);
      }
    }

    // Byte mode indicator (0100)
    pushBits(0b0100, 4);
    pushBits(bytes.length, 8);
    for (let i = 0; i < bytes.length; i++) {
      pushBits(bytes[i], 8);
    }

    // Terminator up to 4 bits
    const rem = totalBits - bits.length;
    pushBits(0, Math.min(4, rem));

    while (bits.length % 8 !== 0) bits.push(0);

    const dataCodewords = new Uint8Array(info.dataBytes);
    for (let i = 0; i < bits.length / 8; i++) {
      let b = 0;
      for (let j = 0; j < 8; j++) b = (b << 1) | bits[i * 8 + j];
      dataCodewords[i] = b;
    }

    let padAlt = false;
    for (let i = bits.length / 8; i < info.dataBytes; i++) {
      dataCodewords[i] = padAlt ? 0x11 : 0xec;
      padAlt = !padAlt;
    }

    // Split into blocks if needed
    const blockSize = Math.floor(info.dataBytes / info.blocks);
    const dataBlocks = [];
    const ecBlocks = [];
    for (let b = 0; b < info.blocks; b++) {
      const slice = dataCodewords.slice(b * blockSize, (b + 1) * blockSize);
      dataBlocks.push(slice);
      ecBlocks.push(rsEncode(slice, info.ecBytes));
    }

    const finalBytes = [];
    for (let i = 0; i < blockSize; i++) {
      for (let b = 0; b < info.blocks; b++) finalBytes.push(dataBlocks[b][i]);
    }
    for (let i = 0; i < info.ecBytes; i++) {
      for (let b = 0; b < info.blocks; b++) finalBytes.push(ecBlocks[b][i]);
    }

    return { version, info, codewords: finalBytes };
  }

  function buildMatrix(text) {
    const { version, info, codewords } = createCodewords(text);
    const size = version * 4 + 17;
    const matrix = Array.from({ length: size }, () => new Array(size).fill(null));
    const reserved = Array.from({ length: size }, () => new Array(size).fill(false));

    function setModule(r, c, val, isFunc = true) {
      if (r < 0 || r >= size || c < 0 || c >= size) return;
      matrix[r][c] = !!val;
      if (isFunc) reserved[r][c] = true;
    }

    function drawFinder(r, c) {
      for (let dy = -1; dy <= 7; dy++) {
        for (let dx = -1; dx <= 7; dx++) {
          const y = r + dy;
          const x = c + dx;
          if (y < 0 || y >= size || x < 0 || x >= size) continue;
          const inOuter = dy >= 0 && dy <= 6 && dx >= 0 && dx <= 6;
          const inRing = dy === 0 || dy === 6 || dx === 0 || dx === 6;
          const inCore = dy >= 2 && dy <= 4 && dx >= 2 && dx <= 4;
          setModule(y, x, inOuter && (inRing || inCore), true);
        }
      }
    }

    drawFinder(0, 0);
    drawFinder(0, size - 7);
    drawFinder(size - 7, 0);

    // Timing patterns
    for (let i = 8; i < size - 8; i++) {
      setModule(6, i, i % 2 === 0, true);
      setModule(i, 6, i % 2 === 0, true);
    }

    // Alignment patterns
    const align = info.align;
    for (let i = 0; i < align.length; i++) {
      for (let j = 0; j < align.length; j++) {
        const r = align[i];
        const c = align[j];
        if (reserved[r][c]) continue;
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const val = Math.max(Math.abs(dy), Math.abs(dx)) !== 1;
            setModule(r + dy, c + dx, val, true);
          }
        }
      }
    }

    // Reserve format info areas & dark module
    for (let i = 0; i < 9; i++) {
      if (!reserved[8][i]) reserved[8][i] = true;
      if (!reserved[i][8]) reserved[i][8] = true;
    }
    for (let i = 0; i < 8; i++) {
      reserved[8][size - 1 - i] = true;
      reserved[size - 1 - i][8] = true;
    }
    setModule(size - 8, 8, true, true);

    // Place data bits (upward/downward zigzag)
    const allBits = [];
    for (const byte of codewords) {
      for (let i = 7; i >= 0; i--) allBits.push((byte >>> i) & 1);
    }

    let bitIdx = 0;
    let upward = true;
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < size; vert++) {
        const r = upward ? size - 1 - vert : vert;
        for (let j = 0; j < 2; j++) {
          const c = right - j;
          if (!reserved[r][c]) {
            const bit = bitIdx < allBits.length ? allBits[bitIdx++] : 0;
            // Apply mask 0: (r + c) % 2 === 0
            const masked = bit ^ ((r + c) % 2 === 0 ? 1 : 0);
            matrix[r][c] = !!masked;
          }
        }
      }
      upward = !upward;
    }

    // Format info for ECC Level L (01) + Mask 0 (000) -> precomputed BCH bits = 0x77c4
    const formatBits = 0x77c4;
    for (let i = 0; i < 15; i++) {
      const bit = ((formatBits >>> i) & 1) === 1;
      // Around top-left
      if (i < 6) setModule(i, 8, bit, true);
      else if (i < 8) setModule(i + 1, 8, bit, true);
      else if (i === 8) setModule(8, 7, bit, true);
      else setModule(8, 14 - i, bit, true);

      // Split between top-right and bottom-left
      if (i < 8) setModule(8, size - 1 - i, bit, true);
      else setModule(size - 15 + i, 8, bit, true);
    }

    return matrix;
  }

  function renderQRCodeSVG(text, pixelSize = 200) {
    try {
      const matrix = buildMatrix(text);
      const n = matrix.length;
      const margin = 4;
      const total = n + margin * 2;
      let pathData = '';
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if (matrix[r][c]) {
            pathData += `M${c + margin},${r + margin}h1v1h-1z`;
          }
        }
      }
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="${pixelSize}" height="${pixelSize}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#ffffff" rx="1.5"/><path d="${pathData}" fill="#0f172a"/></svg>`;
    } catch (err) {
      console.error('QR Code generation error:', err);
      return `<div style="padding:16px;text-align:center;color:#ef4444;">QR Code 產生失敗</div>`;
    }
  }

  global.renderQRCodeSVG = renderQRCodeSVG;
})(typeof window !== 'undefined' ? window : globalThis);
