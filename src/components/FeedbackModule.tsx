import React, { useState, useEffect } from "react";
import { Star, MessageSquare, Send, Trash2, CheckCircle, Sparkles, Filter, Smile, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface FeedbackRecord {
  id: string;
  responseId: string; // ID of the AI advice or message
  source: "chatbot" | "routing_heuristics";
  disasterName: string;
  rating: number;
  comment: string;
  timestamp: string;
}

interface FeedbackModuleProps {
  responseId?: string;
  source: "chatbot" | "routing_heuristics";
  disasterName: string;
  onSubmitted?: () => void;
  theme?: "light" | "dark";
}

export default function FeedbackModule({
  responseId = "default_response",
  source,
  disasterName,
  onSubmitted,
  theme = "dark"
}: FeedbackModuleProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [feedbackList, setFeedbackList] = useState<FeedbackRecord[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [filterRating, setFilterRating] = useState<number | "all">("all");
  const [isError, setIsError] = useState(false);

  // Load existing feedback records
  useEffect(() => {
    const saved = localStorage.getItem("resp_ai_feedback");
    if (saved) {
      try {
        setFeedbackList(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved feedback", e);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setIsError(true);
      return;
    }

    setIsError(false);
    const newFeedback: FeedbackRecord = {
      id: "feed_" + Date.now(),
      responseId,
      source,
      disasterName,
      rating,
      comment: comment.trim(),
      timestamp: new Date().toLocaleString()
    };

    const updatedList = [newFeedback, ...feedbackList];
    setFeedbackList(updatedList);
    localStorage.setItem("resp_ai_feedback", JSON.stringify(updatedList));

    setSubmitted(true);
    setRating(0);
    setComment("");

    // Trigger parent callback
    if (onSubmitted) {
      onSubmitted();
    }

    // Reset success banner after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
    }, 3500);
  };

  const handleDelete = (id: string) => {
    const updatedList = feedbackList.filter((f) => f.id !== id);
    setFeedbackList(updatedList);
    localStorage.setItem("resp_ai_feedback", JSON.stringify(updatedList));
  };

  // Calculations for stats
  const totalCount = feedbackList.length;
  const averageRating =
    totalCount > 0
      ? (feedbackList.reduce((sum, item) => sum + item.rating, 0) / totalCount).toFixed(1)
      : "0.0";

  const starDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count = feedbackList.filter((item) => item.rating === star).length;
    const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
    return { star, count, percentage };
  });

  const filteredFeedback = feedbackList.filter((item) => {
    if (filterRating === "all") return true;
    return item.rating === filterRating;
  });

  const isLight = theme === "light";

  return (
    <div
      id="feedback-module"
      className={`rounded-2xl border transition duration-200 overflow-hidden ${
        isLight
          ? "bg-white border-slate-200 text-slate-800 shadow-sm"
          : "bg-slate-900/40 border-slate-900 text-slate-100"
      }`}
    >
      <div className={`p-5 space-y-4 ${isLight ? "bg-slate-50/50" : "bg-slate-950/20"}`}>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4.5 w-4.5 text-purple-400" />
          <h3 className={`text-sm font-bold uppercase tracking-wider ${isLight ? "text-slate-900" : "text-white"}`}>
            Rate AI Response Quality
          </h3>
        </div>
        <p className={`text-xs ${isLight ? "text-slate-600" : "text-slate-400"}`}>
          Your feedback is critical. It is logged directly into the system database to help emergency coordinators align routing parameters.
        </p>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-xl border flex items-center gap-3 ${
              isLight
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
            }`}
          >
            <CheckCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold text-xs">Feedback Logged Successfully!</p>
              <p className="text-[10px] opacity-90">Thank you for improving the AI Tactical response engine.</p>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star Selector */}
            <div className="space-y-1.5">
              <label className={`block text-[10px] font-mono uppercase tracking-wider ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                Quality Assessment Score *
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isActive = hoverRating ? star <= hoverRating : star <= rating;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => {
                        setRating(star);
                        setIsError(false);
                      }}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 rounded-md hover:bg-slate-500/10 transition cursor-pointer"
                    >
                      <Star
                        className={`h-6 w-6 transition-transform duration-100 ${
                          isActive
                            ? "fill-amber-400 text-amber-400 scale-110"
                            : isLight
                            ? "text-slate-300 fill-transparent"
                            : "text-slate-700 fill-transparent"
                        }`}
                      />
                    </button>
                  );
                })}
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  rating > 0 
                    ? isLight ? "bg-amber-100 text-amber-800" : "bg-amber-500/10 text-amber-400"
                    : isLight ? "bg-slate-100 text-slate-500" : "bg-slate-950 text-slate-600"
                }`}>
                  {rating === 1 && "Critical Issue"}
                  {rating === 2 && "Poor Guidance"}
                  {rating === 3 && "Acceptable"}
                  {rating === 4 && "Highly Actionable"}
                  {rating === 5 && "Excellent Deployability"}
                  {rating === 0 && "Select Rating"}
                </span>
              </div>
              {isError && (
                <p className="text-[10px] text-red-500 font-mono">⚠️ Please select a 1-5 star score.</p>
              )}
            </div>

            {/* Comment Area */}
            <div className="space-y-1.5">
              <label className={`block text-[10px] font-mono uppercase tracking-wider ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                Add Tactical Notes or Improvements (Optional)
              </label>
              <div className="relative">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="e.g. Recommended sandbag heights were highly accurate, but evacuation route 3 was blocked by landslide."
                  className={`w-full text-xs p-3 rounded-lg border outline-none min-h-[70px] resize-y transition ${
                    isLight
                      ? "bg-white border-slate-200 text-slate-800 focus:border-red-500"
                      : "bg-slate-950 border-slate-900 text-slate-200 focus:border-red-500"
                  }`}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                isLight
                  ? "bg-slate-900 hover:bg-slate-800 text-white"
                  : "bg-red-600 hover:bg-red-500 text-white"
              }`}
            >
              <Send className="h-3.5 w-3.5" />
              <span>Submit Assessment to System DB</span>
            </button>
          </form>
        )}
      </div>

      {/* Community/Previous Feedback & Metrics section */}
      <div className={`p-5 border-t ${isLight ? "border-slate-100" : "border-slate-900/60"}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h4 className={`text-xs font-black uppercase tracking-wider ${isLight ? "text-slate-900" : "text-white"}`}>
              Telemetry Feedback Analytics
            </h4>
            <span className="text-[10px] font-mono text-slate-500">REAL-TIME ACCUMULATED COORDINATION RATINGS</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className={`block text-lg font-black leading-none ${isLight ? "text-slate-900" : "text-white"}`}>
                {averageRating}
              </span>
              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Avg Stars</span>
            </div>
            <div className="h-6 w-[1px] bg-slate-900/60" />
            <div className="text-right">
              <span className={`block text-lg font-black leading-none ${isLight ? "text-slate-900" : "text-white"}`}>
                {totalCount}
              </span>
              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Total Reports</span>
            </div>
          </div>
        </div>

        {totalCount > 0 ? (
          <div className="space-y-4">
            {/* Rating distribution progress bars */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 bg-slate-950/20 p-3 rounded-lg border border-slate-900/40">
              {starDistribution.map(({ star, count, percentage }) => (
                <div key={star} className="flex sm:flex-col items-center gap-1 flex-1">
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] font-mono text-slate-400 w-2.5">{star}</span>
                    <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="flex-1 w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400" style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="text-[8px] font-mono text-slate-500 shrink-0">({count})</span>
                </div>
              ))}
            </div>

            {/* Filter controls */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                <Filter className="h-3 w-3" />
                <span>FILTER RATINGS:</span>
              </div>
              <div className="flex gap-1">
                {["all", 5, 4, 3, 2, 1].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setFilterRating(val as any)}
                    className={`px-2 py-0.5 rounded text-[9px] font-mono transition ${
                      filterRating === val
                        ? isLight
                          ? "bg-slate-200 text-slate-900 font-bold"
                          : "bg-red-500/10 text-red-400 border border-red-500/20 font-bold"
                        : isLight
                        ? "bg-slate-50 text-slate-500 hover:bg-slate-100"
                        : "bg-slate-950 text-slate-500 hover:text-slate-300 border border-transparent hover:border-slate-800"
                    }`}
                  >
                    {val === "all" ? "All" : `${val}★`}
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback List */}
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar select-text">
              <AnimatePresence initial={false}>
                {filteredFeedback.length === 0 ? (
                  <div className="p-4 text-center text-[10px] font-mono text-slate-500 italic bg-slate-950/20 rounded-lg">
                    No ratings found for the selected filter.
                  </div>
                ) : (
                  filteredFeedback.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`p-3 rounded-lg border flex flex-col justify-between gap-1.5 transition ${
                        isLight
                          ? "bg-slate-50/50 border-slate-100"
                          : "bg-slate-950/40 border-slate-900/60"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-extrabold text-red-400 uppercase tracking-wide">
                            {item.disasterName}
                          </span>
                          <span className="text-[8px] text-slate-500">•</span>
                          <span className="text-[8px] font-mono text-slate-500">{item.timestamp}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-2.5 w-2.5 ${
                                i < item.rating ? "fill-amber-400 text-amber-400" : "text-slate-700"
                              }`}
                            />
                          ))}
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-0.5 hover:text-red-400 text-slate-600 transition ml-2 cursor-pointer"
                            title="Delete log"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {item.comment ? (
                        <p className={`text-xs ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                          {item.comment}
                        </p>
                      ) : (
                        <p className="text-[10px] font-mono text-slate-500 italic">No notes provided.</p>
                      )}

                      <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest text-right">
                        Source: {item.source.replace("_", " ")}
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center space-y-2">
            <div className="h-8 w-8 rounded-full bg-slate-950/40 flex items-center justify-center text-slate-600 mx-auto border border-slate-900">
              <Smile className="h-4 w-4" />
            </div>
            <p className="text-[11px] font-mono text-slate-500">
              Awaiting first quality submission. Be the first to evaluate the IBM Granite model!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
