import {Toaster} from 'react-hot-toast';
import Body from './Body';
import Header from './Header';

import './styles/header.scss'
import './styles/app.scss'
import './styles/body.scss'

function App() {

  	return (
		<>
			<Toaster position="top-center" reverseOrder={false}/>

			<div className="main">
            	<div className="gradient" />
        	</div>

			<div className='app'>
				<Header/>
				<Body />
			</div>

		</>
	);
}

export default App;