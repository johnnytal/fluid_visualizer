function webaudio_tooling_obj() {
    var audioContext = new AudioContext();
    
	timeRadius = 0;
	oldDrawX = 0;
	oldDrawY = 0;
	input = null;
	radius = 0;
	sprite = null;
	oldTime = 0;
	oldNote = 0;
	
	averageValue = 0;
	largestFreq = 0;
	largestValue = 0;
	currentValue = 0;

    var BUFF_SIZE = 16384;

    var audioInput = null,
        microphone_stream = null,
        gain_node = null,
        script_processor_node = null,
        script_processor_fft_node = null,
        analyserNode = null;

    if (!navigator.getUserMedia)
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia;

    if (navigator.getUserMedia){
        navigator.getUserMedia({audio:true}, 
          function(stream) {
              start_microphone(stream);
          },
          function(e) {
            alert(e);
          }
        );

    } else { alert('getUserMedia not supported in this browser.'); }

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

             for (var i = 0; i < AMOUNT; i++) {
            	 averageValue += array[i];
             }
             
             averageValue = averageValue / AMOUNT;
              
             splats_n = parseInt(Math.round(averageValue / 36));
              
              colorFactor = largestFreq;

             if (splats_n >= 1){
                multipleSplats(splats_n, colorFactor);
             }

             largestValue = Math.max.apply(null, array);
              
             SPLAT_FORCE = largestValue;
            
             largestFreq = array.indexOf(largestValue);

			 dominance = largestValue / averageValue;
              
             SPLAT_RADIUS = dominance / 5;

 			 //var n = 0;
 
			 /*sprites.forEach(function(item) {
	             var value = array[n + 50];
	             
	             item.tint =  value * 0xffffff;
	             
	             var scale = (1 + value / 10) / 20;
            
            	 gravValue = -200 + (HEIGHT - item.y) + Math.pow(value, 1.8);
            	 
			     item.body.gravity.y = gravValue;
	
			     item.body.bounce.y = Phaser.Math.clamp(Math.pow(value, 1.5), 0, 1.1);
		
			     item.body.onWorldBounds = new Phaser.Signal();
				
				 frequency1 = Phaser.Math.clamp(Math.pow(largestFreq, 1.5), 130, 520);

			     item.body.onWorldBounds.add(function(){ //tri
			     	osc.set({freq: frequency1, mul: scale / 2.5, beats : averageValue});
			     }, this);

				 n++;
		     });*/
         };      
     }
}

