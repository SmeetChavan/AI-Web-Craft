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

		try {
			
			toast.loading("Generating..");
	
			setIsLoading(true);
			setIsDisabled(true);
			const response = await axios.post("http://localhost:4000/assist" , {
				text: req,
			});
			
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
	}

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

	const handleAudioUpload = async (e) => {

		const file = e.target.files[0];
		const formData = new FormData();
		formData.append("audio", file);
	
		setIsLoading(true);
		setIsDisabled(true);

		toast.loading("Transcribing...");
		try {
		  const response = await axios.post("http://localhost:4000/assist-audio", formData, {
			headers: {
			  "Content-Type": "multipart/form-data",
			},
		  });

		  toast.dismiss();
		  toast.success("Transcription Success");
		  setContent(response.data.transcript);
		} catch (error) {
		  console.error("Transcription Error:", error);
		  toast.dismiss();
		  toast.error("Transcription Error");
		}
	
		setIsLoading(false);
		setIsDisabled(false);
	};

  	return (
		<div style={{textAlign: 'center'}}>

			<Toaster position="top-center" reverseOrder={false}/>

			<form>

				<label htmlFor="request"><h1>Enter your request:</h1></label>
				<input value={req} type="text" id="request" onChange={(e) => setReq(e.target.value)} />
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
				<div style={{display: 'flex' , flexDirection: 'column' , gap: '10px' , justifyContent: 'center' , alignItems: 'center'}}>
					<button style={{width: '200px'}} onClick={handleTranscribeAudio}>Start Recording</button><br/>
					<input type="file" accept="audio/*" onChange={(e) => handleAudioUpload(e)} />
			  	</div>
        		) : (
          		<p>Recording...</p>
        		)
			}
		</div>
	);
}

export default App;