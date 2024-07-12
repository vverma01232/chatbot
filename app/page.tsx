"use client";
import Message from "@/component/message";
import { Box, Button, CircularProgress, TextField } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { SSE } from "sse";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

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

  const url = process.env.NEXT_PUBLIC_API_URL!;

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

  const handlePromptChange = (e: any) => {
    const input = e.target.value;
    setPrompt(input);
  };

  const handleKeyPress = (event: any) => {
    if (event.key === 'Enter') {
      handleBtnClick();
    }
  };

  const hanldeClearBtnClick = () => {
    setPrompt("");
    setResult("");
    setMessages([]);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', padding: '20px' }}>
        <div style={{ flexGrow: 1, padding: '10px', height: '65vh', overflow: 'auto' }}>
          {messages.map((message, index) => (
            <Box sx={{ marginBottom: '1rem' }} key={index}>
              <Message sender={message.role} message={message.content} />
            </Box>
          ))}
          {(result != "" && loading) && (
            <Box sx={{ marginBottom: '1rem' }}>
              <Message sender="assistant" message={result} />
            </Box>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: 'space-between', alignItems: 'center' }}>
          {/* */}
          <TextField
            value={prompt}
            onChange={handlePromptChange}
            variant="outlined"
            placeholder="Type here"
            style={{ flexGrow: 1 }}
            onKeyPress={handleKeyPress}
          ></TextField>
          <Button variant="contained" onClick={handleBtnClick} sx={{ marginLeft: "1rem" }} type="submit">
            {loading ? <CircularProgress size="1.2rem" color='secondary' style={{ marginRight: '5px' }} /> : <PlayArrowIcon color='secondary' style={{ marginRight: '5px' }} />}
            {loading ? 'Generating' : 'Submit'}</Button>
          <Button onClick={hanldeClearBtnClick} sx={{ marginLeft: "1rem" }} disabled={loading}>Clear</Button>
        </div>
      </div>
    </main>
  );
}
