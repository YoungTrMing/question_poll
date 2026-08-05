import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface AdvancedSentenceOrderDialogProps {
  isVisible: boolean;
  questionText: string;
  placedSentences?: (string | null)[];
  userValidatedSlots?: boolean[]; // Trạng thái đúng/sai [ô1, ô2, ô3]
}

export default function AdvancedSentenceOrderDialog({
  isVisible,
  questionText,
  placedSentences = [null, null, null],
  userValidatedSlots = [false, false, false],
}: AdvancedSentenceOrderDialogProps) {

  const [animationStates, setAnimationStates] = useState<number[]>([0, 0, 0]);

  // Ref-based guard: mỗi slot chỉ được phép được XẾP VÀO HÀNG ĐỢI hoạt ảnh ĐÚNG MỘT LẦN.
  const animatedSlotsRef = useRef<Set<number>>(new Set());

  // Hàng đợi xử lý TUẦN TỰ — nếu 2 ô cùng lúc được xác nhận đúng (ví dụ xếp câu 2 kéo theo câu 3
  // cũng tự đúng theo), chúng vẫn phải xuất hiện LẦN LƯỢT, không cùng lúc.
  const queueRef = useRef<number[]>([]);
  const processingRef = useRef(false);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const ringtonePlayedRef = useRef(false);

  const lines = questionText.split("\n").map(l => l.trim()).filter(Boolean);
  const hasNewline = questionText.includes("\n");
  const coreQuestion = hasNewline ? lines.slice(1).join("\n") : questionText;

  const playSnapSound = () => {
    try {
      const audio = new Audio("/sounds/snap.mp3");
      audio.volume = 0.4;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  // Phát khi một thẻ đáp án XUẤT HIỆN (bắt đầu lơ lửng) trên hộp thoại Aircraft
  const playAppearSound = () => {
    try {
      const audio = new Audio("/sounds/buy-success.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  // Phát khi thẻ đáp án SNAP xuống bãi đáp (chạm sàn)
  const playDropSound = () => {
    try {
      const audio = new Audio("/sounds/drop.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  // Phát khi CẢ 3 phương án đều đã đáp xong vào bãi đáp
  const playAllDoneSound = () => {
    try {
      const audio = new Audio("/sounds/ringtone.mp3");
      audio.volume = 0.6;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  // Reset toàn bộ khi không còn ô nào có dữ liệu (đổi câu hỏi / reset)
  useEffect(() => {
    if (placedSentences.every(s => s === null)) {
      setAnimationStates([0, 0, 0]);
      animatedSlotsRef.current.clear();
      queueRef.current = [];
      processingRef.current = false;
      ringtonePlayedRef.current = false;
      clearAllTimeouts();
    }
  }, [placedSentences]);

  // Xử lý một ô trong hàng đợi: chờ 1s -> xuất hiện lơ lửng (kèm âm thanh) -> hạ cánh -> viền sáng
  // -> xong thì mới bắt đầu xử lý ô tiếp theo trong hàng đợi (tuần tự, không chồng lấn)
  const processQueue = () => {
    if (processingRef.current) return;
    const nextIndex = queueRef.current.shift();
    if (nextIndex === undefined) return;

    processingRef.current = true;
    const i = nextIndex;

    // Yêu cầu 4: chờ 1 giây sau khi người dùng kéo đúng, rồi thẻ mới xuất hiện trên Aircraft
    const tWait = setTimeout(() => {
      playAppearSound();
      setAnimationStates(prev => {
        const next = [...prev];
        next[i] = 1; // Bay lơ lửng
        return next;
      });

      const t1 = setTimeout(() => {
        playSnapSound();
        playDropSound();
        setAnimationStates(prev => {
          const next = [...prev];
          next[i] = 2; // Hạ cánh (snap)
          return next;
        });

        const t2 = setTimeout(() => {
          setAnimationStates(prev => {
            const next = [...prev];
            next[i] = 3; // Viền men vàng
            return next;
          });
          // Ô này đã hoàn tất toàn bộ chuỗi -> giải phóng hàng đợi cho ô kế tiếp
          processingRef.current = false;
          processQueue();
        }, 400);
        timeoutsRef.current.push(t2);
      }, 1200);
      timeoutsRef.current.push(t1);
    }, 1000);
    timeoutsRef.current.push(tWait);
  };

  // Phát hiện các ô mới được xác nhận đúng và xếp vào hàng đợi (không xử lý ngay lập tức)
  useEffect(() => {
    placedSentences.forEach((incomingText, i) => {
      const isSlotValidated = userValidatedSlots[i];
      if (
        incomingText &&
        isSlotValidated &&
        !animatedSlotsRef.current.has(i) &&
        !queueRef.current.includes(i)
      ) {
        animatedSlotsRef.current.add(i);
        queueRef.current.push(i);
      }
    });
    processQueue();
  }, [placedSentences, userValidatedSlots]);

  // Yêu cầu 5: khi cả 3 bãi đáp đều đã hạ cánh xong (viền sáng), phát âm thanh hoàn tất
  useEffect(() => {
    if (animationStates.length === 3 && animationStates.every(s => s >= 3) && !ringtonePlayedRef.current) {
      ringtonePlayedRef.current = true;
      playAllDoneSound();
    }
  }, [animationStates]);

  // Dọn dẹp toàn bộ timeout khi component unmount
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, []);

  const cardSnapVariants: Variants = {
    initial: { scale: 0.6, y: -40, opacity: 0, filter: "blur(4px)" },
    floating: {
      scale: [1.1, 1.02, 1.08, 1.04],
      y: [-34, -18, -28, -22], // lơ lửng cao hơn hẳn mặt bãi đáp, không bị chìm phía sau
      opacity: 1,
      filter: "blur(0px)",
      transition: { duration: 1.2, ease: "easeInOut" }
    },
    snapped: {
      y: 0, scale: 1, opacity: 1, filter: "blur(0px)",
      transition: { type: "spring", stiffness: 450, damping: 20 }
    }
  };

  // Kích thước canvas đo đạc gốc — khớp đúng kích thước pixel thật của 196.png (864 x 1238)
  const baseW = 864;
  const baseH = 1238;

  const slot1Style = {
    left: `${(27 / baseW) * 100}%`,
    top: `${(20 / baseH) * 100}%`,
    width: `${(817 / baseW) * 100}%`,
    height: `${(1208 / baseH) * 100}%`,
    borderRadius: `195.5px 188.3px 208.3px 214.0px`,
  };

  // Dữ liệu đo đạc từng bãi đáp (đồng bộ với device2.json) + bán kính bo góc trung bình
  const padGeometry = [
    { left: 95, top: 432, width: 682, height: 221, radii: [33.7, 38.5, 38.3, 36.2] },
    { left: 96, top: 683, width: 681, height: 221, radii: [28.3, 31.9, 33.3, 40.2] },
    { left: 95, top: 934, width: 681, height: 220, radii: [33.5, 30.3, 34.6, 37.1] },
  ];

  const slotsConfig = padGeometry.map(p => ({
    left: `${(p.left / baseW) * 100}%`,
    top: `${(p.top / baseH) * 100}%`,
    width: `${(p.width / baseW) * 100}%`,
    height: `${(p.height / baseH) * 100}%`,
    borderRadius: `${p.radii[0]}px ${p.radii[1]}px ${p.radii[2]}px ${p.radii[3]}px`,
    avgRadius: p.radii.reduce((a, b) => a + b, 0) / p.radii.length,
    pxWidth: p.width,
    pxHeight: p.height,
  }));

  // Khoảng hở giữa các bãi đáp — nơi đặt mũi tên nét đứt chỉ xuống
  const arrowGaps = [
    {
      top: padGeometry[0].top + padGeometry[0].height,
      height: padGeometry[1].top - (padGeometry[0].top + padGeometry[0].height),
      centerX: padGeometry[0].left + padGeometry[0].width / 2,
    },
    {
      top: padGeometry[1].top + padGeometry[1].height,
      height: padGeometry[2].top - (padGeometry[1].top + padGeometry[1].height),
      centerX: padGeometry[1].left + padGeometry[1].width / 2,
    },
  ];

  const ARROW_W = 40;
  const DASH_PATTERN = "26 16";
  const DASH_CYCLE = 42; // 26 + 16, để vòng lặp offset liền mạch

  // Vị trí các đèn viền bãi đáp (mô phỏng đèn hai bên đường băng), theo % chiều rộng
  const lightPositions = [10, 30, 50, 70, 90];

  return (
    <motion.div
      initial={{ opacity: 0, x: "-70%", y: "-50%" }}
      animate={
        isVisible
          ? { opacity: 1, x: "0%", y: "-50%" }
          : { opacity: 0, x: "-70%", y: "-50%" }
      }
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="select-none"
      style={{
        position: "absolute",
        top: "47%",
        left: "4%",
        zIndex: 30,
        pointerEvents: isVisible ? "auto" : "none",
        width: "720px",
        height: "1031px",
      }}
    >
      {/* LỚP BỒNG BỀNH — nhích từng pixel (bước rời rạc rất nhỏ, kiểu sprite pixel-art) */}
      <motion.div
        animate={
          isVisible
            ? { y: [0, 1, 2, 2, 3, 3, 2, 2, 1, 1, 0, 0] }
            : { y: 0 }
        }
        transition={
          isVisible
            ? {
                duration: 3.2,
                ease: "linear",
                repeat: Infinity,
                repeatType: "loop",
                times: [0, 0.09, 0.18, 0.27, 0.36, 0.45, 0.54, 0.63, 0.72, 0.81, 0.9, 1],
              }
            : { duration: 0.2 }
        }
        style={{ width: "100%", height: "100%" }}
      >
        {/* KHUNG VỎ MÁY GỐC */}
        <div
          className="w-full h-full relative rounded-[45px]"
          style={{
            backgroundImage: "url('/196.png')",
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            filter: "drop-shadow(0 30px 50px rgba(0,0,0,0.4))",
          }}
        >

          {/* 1. MÀN HÌNH NEO KÍNH XANH */}
          <div
            className="absolute overflow-hidden"
            style={{
              top: "21.5%",
              left: "12.2%",
              width: "75.6%",
              height: "11.0%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 32px",
              boxSizing: "border-box"
            }}
          >
            <p
              className="text-center font-extrabold tracking-tight leading-snug"
              style={{
                fontFamily: "'Lexend', 'Inter', system-ui, sans-serif",
                fontSize: "24px",
                color: "#051f21",
                textShadow: "0 1px 1.5px rgba(255, 255, 255, 0.5)",
                WebkitFontSmoothing: "antialiased",
              }}
            >
              {coreQuestion || "Arrange the sentences in the correct order."}
            </p>
          </div>

          {/* 1.5 MŨI TÊN NÉT ĐỨT NỐI GIỮA CÁC BÃI ĐÁP — men vàng tiếp nối sau khi viền bãi đáp trước hoàn tất */}
          {arrowGaps.map((gap, i) => {
            const isActive = animationStates[i] >= 3;
            return (
              <div
                key={`arrow-${i}`}
                className="absolute pointer-events-none"
                style={{
                  left: `${((gap.centerX - ARROW_W / 2) / baseW) * 100}%`,
                  top: `${(gap.top / baseH) * 100}%`,
                  width: `${(ARROW_W / baseW) * 100}%`,
                  height: `${(gap.height / baseH) * 100}%`,
                  zIndex: 15,
                }}
              >
                <svg viewBox="0 0 40 30" width="100%" height="100%" style={{ overflow: "visible" }}>
                  <line x1="20" y1="0" x2="20" y2="20" stroke="rgba(255,255,255,0.35)" strokeWidth="3" strokeDasharray="5 5" strokeLinecap="round" />
                  <polygon points="13,18 27,18 20,29" fill="rgba(255,255,255,0.35)" />
                  <motion.line
                    x1="20" y1="0" x2="20" y2="20"
                    stroke="#FFD400"
                    strokeWidth="4"
                    strokeDasharray="5 5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: isActive ? 1 : 0, opacity: isActive ? 1 : 0 }}
                    transition={{ duration: 0.5, delay: isActive ? 0.15 : 0, ease: "easeOut" }}
                  />
                  <motion.polygon
                    points="13,18 27,18 20,29"
                    fill="#FFD400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isActive ? 1 : 0 }}
                    transition={{ duration: 0.3, delay: isActive ? 0.6 : 0 }}
                  />
                </svg>
              </div>
            );
          })}

          {/* 2. KHỚP CÁC BÃI ĐÁP THEO TỌA ĐỘ VÀ BO GÓC CHUẨN XÁC */}
          {slotsConfig.map((slot, index) => {
            const sentenceText = placedSentences[index];
            const animState = animationStates[index];
            const isCorrect = userValidatedSlots[index];
            const number = index + 1;
            const borderActive = animState >= 3 && isCorrect;
            const strokeW = 8;
            const inset = strokeW / 2;
            const maskId = `pad-reveal-mask-${index}`;

            return (
              <div
                key={`slot-${number}`}
                className="absolute transition-all duration-300 flex items-center justify-center"
                style={{
                  left: slot.left,
                  top: slot.top,
                  width: slot.width,
                  height: slot.height,
                  borderRadius: slot.borderRadius,
                  background:
                    "radial-gradient(120% 140% at 50% 20%, rgba(28,40,42,0.55) 0%, rgba(8,14,15,0.55) 55%, rgba(4,8,9,0.6) 100%)",
                  boxShadow: "inset 0 12px 18px rgba(0,0,0,0.7), inset 0 -3px 6px rgba(255,255,255,0.05)",
                  // overflow KHÔNG bị ẩn -> thẻ đáp án khi lơ lửng được phép trồi lên trên bãi đáp
                  overflow: "visible",
                }}
              >
                {/* ĐƯỜNG TÂM NÉT ĐỨT — mô phỏng vạch tim đường băng, thuần trang trí */}
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: "8%",
                    right: "8%",
                    top: "50%",
                    height: 0,
                    borderTop: "2px dashed rgba(255,255,255,0.14)",
                    transform: "translateY(-50%)",
                    zIndex: 4,
                  }}
                />

                {/* VIỀN NÉT ĐỨT XOAY LIÊN TỤC QUANH BÃI ĐÁP */}
                <svg
                  className="absolute inset-0 pointer-events-none"
                  width="100%"
                  height="100%"
                  viewBox={`0 0 ${slot.pxWidth} ${slot.pxHeight}`}
                  preserveAspectRatio="none"
                  style={{ zIndex: 12, overflow: "visible" }}
                >
                  <defs>
                    <mask id={maskId} maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x="0" y="0" width={slot.pxWidth} height={slot.pxHeight}>
                      <rect x="0" y="0" width={slot.pxWidth} height={slot.pxHeight} fill="black" />
                      {/* mặt nạ "vẽ dần" quanh viền — chỉ dùng để lộ dần, không quyết định kiểu nét đứt */}
                      <motion.rect
                        x={inset}
                        y={inset}
                        width={slot.pxWidth - strokeW}
                        height={slot.pxHeight - strokeW}
                        rx={Math.max(slot.avgRadius - inset, 0)}
                        ry={Math.max(slot.avgRadius - inset, 0)}
                        fill="none"
                        stroke="white"
                        strokeWidth={strokeW * 3}
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: borderActive ? 1 : 0 }}
                        transition={{ duration: 0.9, ease: "easeInOut" }}
                      />
                    </mask>
                  </defs>

                  {/* viền nền mờ — luôn hiển thị, xoay liên tục (marching ants) */}
                  <motion.rect
                    x={inset}
                    y={inset}
                    width={slot.pxWidth - strokeW}
                    height={slot.pxHeight - strokeW}
                    rx={Math.max(slot.avgRadius - inset, 0)}
                    ry={Math.max(slot.avgRadius - inset, 0)}
                    fill="none"
                    stroke="rgba(255,255,255,0.45)"
                    strokeWidth={strokeW}
                    strokeDasharray={DASH_PATTERN}
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    animate={{ strokeDashoffset: [0, -DASH_CYCLE] }}
                    transition={{ duration: 2.6, ease: "linear", repeat: Infinity }}
                  />

                  {/* viền men vàng — vẫn giữ dạng NÉT ĐỨT trong suốt quá trình lộ dần (dùng mask thay vì pathLength trực tiếp),
                      và tiếp tục xoay liên tục sau khi đã hiện đầy đủ. Màu vàng tươi (safety yellow) + nét dày hơn để nổi bật. */}
                  <motion.rect
                    x={inset}
                    y={inset}
                    width={slot.pxWidth - strokeW}
                    height={slot.pxHeight - strokeW}
                    rx={Math.max(slot.avgRadius - inset, 0)}
                    ry={Math.max(slot.avgRadius - inset, 0)}
                    fill="none"
                    stroke="#FFD400"
                    strokeWidth={strokeW + 1}
                    strokeDasharray={DASH_PATTERN}
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    mask={`url(#${maskId})`}
                    style={{ filter: "drop-shadow(0 0 6px rgba(255,212,0,0.85))" }}
                    animate={{ strokeDashoffset: [0, -DASH_CYCLE] }}
                    transition={{ duration: 2.6, ease: "linear", repeat: Infinity }}
                  />
                </svg>

                {/* GÓC NGẮM — 4 dấu góc kiểu bãi đáp máy bay/khung target */}
                {[
                  { top: 6, left: 6, sides: { borderTop: true, borderLeft: true } },
                  { top: 6, right: 6, sides: { borderTop: true, borderRight: true } },
                  { bottom: 6, left: 6, sides: { borderBottom: true, borderLeft: true } },
                  { bottom: 6, right: 6, sides: { borderBottom: true, borderRight: true } },
                ].map((corner, ci) => {
                  const { sides, ...pos } = corner as any;
                  const activeColor = borderActive ? "#FFD400" : "rgba(255,255,255,0.4)";
                  return (
                    <div
                      key={`corner-${index}-${ci}`}
                      className="absolute pointer-events-none"
                      style={{
                        ...pos,
                        width: "20px",
                        height: "20px",
                        borderTop: sides.borderTop ? `3px solid ${activeColor}` : undefined,
                        borderBottom: sides.borderBottom ? `3px solid ${activeColor}` : undefined,
                        borderLeft: sides.borderLeft ? `3px solid ${activeColor}` : undefined,
                        borderRight: sides.borderRight ? `3px solid ${activeColor}` : undefined,
                        borderRadius: "3px",
                        zIndex: 13,
                        filter: borderActive ? "drop-shadow(0 0 4px rgba(255,212,0,0.8))" : "none",
                        transition: "border-color 0.4s ease, filter 0.4s ease",
                      }}
                    />
                  );
                })}

                {/* ĐÈN VIỀN HAI BÊN — mô phỏng đèn dẫn đường băng, sáng lên khi bãi đáp đã đúng */}
                {lightPositions.map((pct, li) => (
                  <div key={`light-top-${index}-${li}`}>
                    <motion.div
                      className="absolute pointer-events-none rounded-full"
                      style={{
                        left: `${pct}%`,
                        top: "5px",
                        width: "6px",
                        height: "6px",
                        transform: "translateX(-50%)",
                        zIndex: 13,
                        background: borderActive ? "#FFD400" : "rgba(255,255,255,0.35)",
                        boxShadow: borderActive ? "0 0 7px 2px rgba(255,212,0,0.9)" : "none",
                      }}
                      animate={borderActive ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
                      transition={borderActive ? { duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: li * 0.12 } : { duration: 0.3 }}
                    />
                    <motion.div
                      className="absolute pointer-events-none rounded-full"
                      style={{
                        left: `${pct}%`,
                        bottom: "5px",
                        width: "6px",
                        height: "6px",
                        transform: "translateX(-50%)",
                        zIndex: 13,
                        background: borderActive ? "#FFD400" : "rgba(255,255,255,0.35)",
                        boxShadow: borderActive ? "0 0 7px 2px rgba(255,212,0,0.9)" : "none",
                      }}
                      animate={borderActive ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
                      transition={borderActive ? { duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 0.7 + li * 0.12 } : { duration: 0.3 }}
                    />
                  </div>
                ))}

                {/* SỐ HIỆU BÃI ĐÁP — sơn phẳng trực tiếp trên mặt sàn, kiểu ký hiệu bãi đáp tàu sân bay
                    (vòng sơn mờ đã bạc màu + số kẻ nét lớn), thay cho huy hiệu 3D nổi trước đây */}
                {!(sentenceText && animState >= 1) && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10">
                    <div
                      className="w-[76px] h-[76px] relative"
                      style={{
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {/* vòng sơn ngoài, đã sờn/bạc màu như sơn kẻ trên sàn đáp */}
                      <div
                        className="absolute inset-0"
                        style={{
                          borderRadius: "50%",
                          border: "3px solid rgba(255,214,0,0.5)",
                          boxShadow: "0 0 0 1px rgba(0,0,0,0.35) inset",
                        }}
                      />
                      {/* vòng trong mảnh, tạo chiều sâu kẻ vạch kép như thực tế */}
                      <div
                        className="absolute"
                        style={{
                          inset: "8px",
                          borderRadius: "50%",
                          border: "1px solid rgba(255,255,255,0.18)",
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "'Barlow Condensed', 'Oswald', 'Arial Narrow', sans-serif",
                          fontWeight: 700,
                          fontSize: "38px",
                          letterSpacing: "1px",
                          color: "rgba(255,255,255,0.82)",
                          textShadow: "0 2px 2px rgba(0,0,0,0.65)",
                        }}
                      >
                        {number}
                      </span>
                    </div>
                  </div>
                )}

                {/* THẺ ĐÁP ÁN — dạng biển hiệu buồng lái, chữ lớn căn trái, z-index cao nhất */}
                <AnimatePresence mode="wait">
                  {sentenceText && animState >= 1 && (
                    <motion.div
                      key={`sentence-block-${number}`}
                      variants={cardSnapVariants}
                      initial="initial"
                      animate={animState === 1 ? "floating" : "snapped"}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="w-[92%] h-[84%] rounded-[22px] flex items-center relative overflow-hidden"
                      style={{
                        background: "linear-gradient(155deg, #fdfaf3 0%, #f4edd9 55%, #ece1c4 100%)",
                        border: "2px solid #cbb488",
                        boxShadow:
                          "0 12px 22px rgba(0,0,0,0.32), inset 0 2px 0 rgba(255,255,255,0.85), inset 0 -3px 6px rgba(0,0,0,0.08)",
                        zIndex: 40,
                      }}
                    >
                      {/* dải nhấn màu hổ phách bên trái, kiểu biển hiệu */}
                      <div
                        className="absolute left-0 top-0 bottom-0 pointer-events-none"
                        style={{
                          width: "10px",
                          background: "linear-gradient(180deg, #f7b733 0%, #c9790b 100%)",
                          boxShadow: "1px 0 4px rgba(0,0,0,0.25)",
                        }}
                      />
                      {/* ánh gương nhẹ phía trên, giữ chút chiều sâu 3D như thẻ vật lý */}
                      <div className="absolute left-1.5 right-1.5 top-0.5 h-[35%] rounded-t-[18px] bg-gradient-to-b from-white/70 to-transparent pointer-events-none" />
                      {/* đinh tán trang trí 4 góc, tạo cảm giác biển hiệu kim loại gắn trên khoang */}
                      {[
                        { top: 8, left: 18 }, { top: 8, right: 8 },
                        { bottom: 8, left: 18 }, { bottom: 8, right: 8 },
                      ].map((pos, ri) => (
                        <div
                          key={`rivet-${number}-${ri}`}
                          className="absolute rounded-full pointer-events-none"
                          style={{
                            ...pos,
                            width: "5px",
                            height: "5px",
                            background: "rgba(0,0,0,0.18)",
                            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.6)",
                          }}
                        />
                      ))}

                      <p
                        className="text-left relative z-10 leading-tight"
                        style={{
                          fontFamily: "'Barlow Condensed', 'Oswald', 'Arial Narrow', sans-serif",
                          fontWeight: 600,
                          fontSize: "29px",
                          letterSpacing: "0.2px",
                          color: "#4a463d",
                          paddingLeft: "30px",
                          paddingRight: "22px",
                        }}
                      >
                        {sentenceText}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

        </div>
      </motion.div>
    </motion.div>
  );
}