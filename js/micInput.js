audioContext = new AudioContext();

averageValue = 0;
largestFreq = 0;
largestValue = 0;
currentValue = 0;

BUFF_SIZE = 16384;

audioInput = null,
microphone_stream = null,
gain_node = null,
script_processor_node = null,
script_processor_fft_node = null,
analyserNode = null;
    
function webaudio_tooling_obj() {
    if (!navigator.getUserMedia)
            navigator.mediaDevices.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia;

    if (navigator.getUserMedia){
        navigator.getUserMedia({audio:true}, 
          function(stream) {
              start_microphone(stream);
          },
          function(e) {
              alert('getUserMedia: ' + e);
          }
        );
    } else { alert('getUserMedia not supported in this browser.'); }  
}

function start_microphone(stream){
	      gain_node = audioContext.createGain();
	      gain_node.connect( audioContext.destination );
	
	      microphone_stream = audioContext.createMediaStreamSource(stream);
	      microphone_stream.connect(gain_node); 
	
	      script_processor_node = audioContext.createScriptProcessor(BUFF_SIZE, 1, 1);

	      microphone_stream.connect(script_processor_node);
	
	      gain_node.gain.value = 0;
	
	      script_processor_fft_node = audioContext.createScriptProcessor(2048, 1, 1);
	      script_processor_fft_node.connect(gain_node);
	
	      analyserNode = audioContext.createAnalyser();
	
	      analyserNode.smoothingTimeConstant = 0;
	      analyserNode.fftSize = 2048;
	
	      microphone_stream.connect(analyserNode);
	
	      analyserNode.connect(script_processor_fft_node);
	
	      script_processor_fft_node.onaudioprocess = function() {
	      	 array = new Uint8Array(analyserNode.frequencyBinCount);
	      	 analyserNode.getByteFrequencyData(array);

             for (var i = 0; i < array.length - 1; i++) {
            	 averageValue += array[i];
             }
             
             averageValue = averageValue / array.length - 1;
              
             splats_n = parseInt(Math.round(averageValue / 25));
             
             largestValue = Math.max.apply(null, array);
             largestFreq = array.indexOf(largestValue);

             if (splats_n >= 1){
                multipleSplats(splats_n);
             }
             
             config.SPLAT_RADIUS = largestValue / 200;
             config.CURL = largestFreq * 4.5;
             if (config.CURL > 150) config.CURL = 150;
         };      
     }

async function getDevices() {     
	const devices = await navigator.mediaDevices.enumerateDevices();
	audioDevices = devices.filter(device => device.kind === 'audioinput');

	navigator.getUserMedia( { audio: {deviceId: audioDevices[2].deviceId} },
        function(stream) {
    		start_microphone(stream);
        },
        function(e) {
            alert(e);
        }
	);
}