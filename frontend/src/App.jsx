import axios from "axios";
import { useState } from "react";

import {toast , Toaster} from 'react-hot-toast';

function App() {

	const [req , setReq] = useState("");
	const [content , setContent] = useState("");
	const [isLoading , setIsLoading] = useState(false);
	const [isDisabled , setIsDisabled] = useState(false);
	const [recording, setRecording] = useState(false);

	const handleSubmit = async(e) => {
		e.preventDefault();

		
		toast.loading("Generating..");

		setIsLoading(true);
		setIsDisabled(true);
		const response = await axios.post("http://localhost:4000/assist" , {
			text: req,
		});
		
		setIsLoading(false);
		toast.dismiss();
		toast.success("Success");
		setContent(response.data);
		setReq("");
		setIsDisabled(false);
	}

	const handleOpenInNewTab = () => {
		if (content) {
		  const newWindow = window.open();
		  newWindow.document.write(content);
		  newWindow.document.close();
		}
	};

	const handleStartRecording = () => {
		setRecording(true);
		const recognition = new window.webkitSpeechRecognition();
		recognition.continuous = true;
	
		recognition.onresult = (event) => {
		  const transcript = event.results[event.results.length - 1][0].transcript;
		  setRecording(false);
		  sendAudioRequest(transcript);
		};
	
		recognition.onerror = (event) => {
		  console.error("Speech recognition error:", event.error);
		  setRecording(false);
		};
	
		recognition.start();
	};
	
	const sendAudioRequest = async (transcript) => {
		try {
			const response = await axios.post("http://localhost:4000/assist", {
			audio: transcript,
			});
			setContent(response.data);
		} catch (error) {
			console.error("Error sending audio request:", error);
		}
	};

  	return (
		<div style={{textAlign: 'center'}}>

			<Toaster position="top-center" reverseOrder={false}/>

			<form>

				<label htmlFor="request"><h1>Enter your request:</h1></label>
				<input type="text" id="request" onChange={(e) => setReq(e.target.value)} />
				<input disabled={isDisabled} type="submit" value="Submit" onClick={(e) => handleSubmit(e)} />
			</form>

			{/* <div dangerouslySetInnerHTML={{ __html: content }} /> */}
			{/* <div dangerouslySetInnerHTML={{__html: content}} /> */}

			{isLoading && (
				<p>Please give us 30 seconds...</p>
			)}

			{content && (
          	<button style={{marginTop: '30px'}} onClick={handleOpenInNewTab}>Open your website</button>
        	)}

			{!recording ? (
          		<button onClick={handleStartRecording}>Start Recording</button>
        		) : (
          		<p>Recording...</p>
        		)
			}
		</div>
	);
}

export default App;