import axios from "axios";
import { useState } from "react";

import { toast } from "react-hot-toast";

const Body = () => {
  const [req, setReq] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [recording, setRecording] = useState(false);

  let downloadLink;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      toast.loading("Generating..");

      setIsLoading(true);
      setIsDisabled(true);
      const response = await axios.post("http://localhost:4000/assist", {
        text: req,
      });

      const blob = new Blob([response.data], { type: "text/html" });

      // Create a download link
      downloadLink = document.createElement("a");
      downloadLink.href = window.URL.createObjectURL(blob);
      downloadLink.download = "website.html";

      // Simulate a click event to trigger the download
      downloadLink.click();

      toast.dismiss();
      toast.success("Success");

      setContent(response.data);

    } catch (error) {
      toast.dismiss();
      toast.error(error.message);
    }

    setIsLoading(false);
    setReq("");
    setIsDisabled(false);
  };

  const handleOpenInNewTab = () => {
    if (content) {
      const newWindow = window.open();
      newWindow.document.write(content);
      newWindow.document.close();
    }
  };

  const handleTranscribeAudio = () => {
    setRecording(true);
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setRecording(false);
      setReq(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setRecording(false);
    };

    recognition.start();
  };

  return (
    <div className="body">
      <form>
        <input
          value={req}
          type="text"
          id="request"
          onChange={(e) => setReq(e.target.value)}
          placeholder="Enter a prompt"
        />
        <input
          disabled={isDisabled}
          id="submit_btn"
          type="submit"
          value="Submit"
          onClick={(e) => handleSubmit(e)}
        />
      </form>

      {isLoading && <p>Please give us 30 seconds...</p>}

      {content && (
        <button className="start_record" onClick={handleOpenInNewTab}>
          Open your website
        </button>
      )}

      {!recording ? (
        <div>
          <button className="start_record" onClick={handleTranscribeAudio}>
            Start Recording
          </button>
        </div>
      ) : (
        <p>Recording...</p>
      )}
    </div>
  );
};

export default Body;
