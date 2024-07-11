"use client";
import { useEffect, useRef, useState } from "react";
import { SSE } from "sse";

export interface IParameters {
  temperature: number,
  max_tokens: number,
  top_p: number,
  model_id: string
}

type message = {
  role: string,
  content: string
}


export default function Home() {

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [parameters, setParameters] = useState<IParameters>();
  const [messages, setMessages] = useState<message[]>([]);

  const url = "";

  const resultRef = useRef<string>();

  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  const handleBtnClick = async () => {
    if (prompt !== "") {
      setLoading(true);
      setResult("");
      const uMessages = [...messages, { role: 'user', content: prompt }];
      setMessages(uMessages);
      /* const jwtToken = localStorage.getItem(LOCALSTORAGE_CONSTANTS.token);
      const username = JSON.parse(
        window.localStorage.getItem(LOCALSTORAGE_CONSTANTS.userName)!
      ); */
      const data = {
        model: parameters?.model_id,
        messages: uMessages,
        options: {
          temperature: Number(parameters?.temperature),
          top_p: Number(parameters?.top_p),
          max_tokens: Number(parameters?.max_tokens)
        }
      }
      const source = new SSE(url, {
        method: "POST",
        payload: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      source.addEventListener("message", (e: any) => {
        let text = '';
        const payload = JSON.parse(e.data);
        if (payload.done != true) {
          setPrompt("");
          console.log(payload);
          text = payload?.message?.content;
          if (text !== "\n") {
            resultRef.current = resultRef.current + text + " ";
            console.log("resultRef.current: " + resultRef.current);
            setResult(resultRef.current);
          }
        } else {
          setMessages([...uMessages, { role: 'assistant', content: resultRef.current! }])
          source.close();
        }
      });

      source.addEventListener("readystatechange", (e: any) => {
        if (e.readyState >= 2) {
          setLoading(false);
        }
      });
      source.stream();
    } else {
      alert("Please insert a Prompt! ");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">

    </main>
  );
}
