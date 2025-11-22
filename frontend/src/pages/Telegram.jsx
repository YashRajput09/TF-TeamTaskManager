import React, { useState } from "react";
import axios from "axios";
import Card from "../components/Card";
import {
  MessageCircle,
  CheckCircle,
  Bot,
  Bell,
  RefreshCw,
  Users,
  Copy,
  ExternalLink,
} from "lucide-react";
import axiosInstance from "./utility/axiosInstance";

const API_BASE = "http://localhost:3000"; // change if you use env/proxy

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const TelegramPage = () => {
  const [linkToken, setLinkToken] = useState("");
  const [loadingToken, setLoadingToken] = useState(false);

  const generateLinkToken = async () => {
    setLoadingToken(true);
    try {
      // Backend: POST /integration/telegram/link-token
      const res = await axiosInstance.post("/integration/telegram/link-token");
      if (res.data?.token) {
        setLinkToken(res.data.token);
        alert(
          "Link code generated! Open the Telegram bot and send this code to link your account."
        );
      } else {
        throw new Error("No token returned from server");
      }
    } catch (err) {
      console.error("Failed to generate link token:", err);
      alert(
        `Failed to generate link code: ${
          err.response?.data?.message || err.message
        }`
      );
    } finally {
      setLoadingToken(false);
    }
  };

  const copyToken = async () => {
    if (!linkToken) return;
    try {
      await navigator.clipboard.writeText(linkToken);
      alert("Link code copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy token:", err);
      alert("Could not copy code. Please copy it manually.");
    }
  };

const openBot = () => {
  window.open("https://t.me/teamTask01Bot", "_blank", "noreferrer");
};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Telegram Setup
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Connect Telegram to get task assignment updates and reminders.
          </p>
        </div>

        <button
          type="button"
          onClick={openBot}
          className="mt-3 md:mt-0 inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Open Telegram Bot</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Instructions */}
        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <Bot className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Setup Instructions
            </h2>
          </div>

          <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
            {/* Step 1 */}
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Find our Telegram Bot
                </p>
                <p>
                  Search for{" "}
                  <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">
                    @teamTask01Bot
                  </code>{" "}
                  on Telegram and open the chat.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Start the Bot
                </p>
                <p>
                  Send{" "}
                  <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">
                    /start
                  </code>{" "}
                  to begin and allow the bot to send you messages.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Generate Link Code in Web App
                </p>
                <p>
                  Click{" "}
                  <span className="font-semibold">Generate Link Code</span> on
                  the right. You&apos;ll get a short unique code valid for a
                  limited time.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                4
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Send Code to the Bot
                </p>
                <p>
                  Paste that code in the Telegram chat (or send{" "}
                  <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">
                    /verify &lt;code&gt;
                  </code>
                  ). Your Telegram chat will then be linked to this account.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                5
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Receive Notifications Automatically
                </p>
                <p>
                  Once linked, you&apos;ll automatically receive Telegram
                  messages whenever tasks are assigned to you or auto-balanced
                  by the AI workload system.
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                No need to manually find your Chat ID
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                The link-code flow securely connects your Telegram chat with
                your account. Your chat ID is stored automatically in the
                backend once the bot verifies your code.
              </p>
            </div>
          </div>
        </Card>

        {/* Right: Link Code Card */}
        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <MessageCircle className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Link Your Telegram
            </h2>
          </div>

          <div className="space-y-4">
            {/* Code display */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Telegram Link Code
              </label>

              {linkToken ? (
                <div className="flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <span className="font-mono text-sm text-gray-900 dark:text-gray-100">
                    {linkToken}
                  </span>
                  <button
                    type="button"
                    onClick={copyToken}
                    className="inline-flex items-center space-x-1 text-xs px-2 py-1 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Generate a link code to connect your Telegram chat with your
                  account.
                </p>
              )}

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Paste this code into the Telegram bot chat to complete linking.
                Codes expire after a short time for security.
              </p>
            </div>

            {/* Generate button */}
            <button
              type="button"
              onClick={generateLinkToken}
              disabled={loadingToken}
              className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                loadingToken
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {loadingToken ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span>
                {loadingToken ? "Generating..." : "Generate Link Code"}
              </span>
            </button>
          </div>
        </Card>
      </div>

      {/* Bottom: What you receive */}
      <Card>
        <div className="flex items-center space-x-3 mb-4">
          <Bell className="w-6 h-6 text-purple-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            What You&apos;ll Receive
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: CheckCircle,
              title: "Task Assignments",
              desc: "Instant alerts when new tasks are assigned to you.",
            },
            {
              icon: Bell,
              title: "Deadline Reminders",
              desc: "Reminders before important task deadlines (if enabled).",
            },
            {
              icon: RefreshCw,
              title: "Status Updates",
              desc: "Updates when tasks are completed or re-assigned.",
            },
            {
              icon: Users,
              title: "AI Redistribution",
              desc: "Notifications when tasks are auto-balanced for workload.",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <Icon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default TelegramPage;
