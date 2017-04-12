{
	let me = true;//黑棋
	let over = false;//表示这局棋有没有结束
	let chessBoard = [];//用来存储当前位置有没有棋子
	let wins = [];//赢法数组,用来保存五子棋所有的赢法
	let myWin = [];//我方赢法情况统计
	let pcWin = [];//AI赢法情况统计
	//初始化棋子坐标
	for(let i=0; i<15; i++){
		chessBoard[i] = [];
		for(let j=0; j<15; j++){
			//0代表当前位置没有棋子
			chessBoard[i][j] = 0;
		}
	}
	//赢法数组初始化
	for(let i=0; i<15; i++){
		wins[i] = [];
		for(let j=0; j<15; j++){
			wins[i][j] = [];
			//这两层循环,是初始化了一个三维数组
		}
	}
		let count = 0;//代表赢法种类的一个索引
		//所有横向的赢法
		for(let i=0; i<15; i++){
			for(let j=0; j<11; j++){
				for(let k=0; k<5; k++){
					wins[i][j+k][count] = true;
				}
				count++;
			}
		}
		//所有竖向的赢法
		for(let i=0; i<15; i++){
			for(let j=0; j<11; j++){
				for(let k=0; k<5; k++){
					wins[j+k][i][count] = true;
				}
				count++;
			}
		}
		//所有斜线的赢法
		for(let i=0; i<11; i++){
			for(let j=0; j<11; j++){
				for(let k=0; k<5; k++){
					wins[i+k][j+k][count] = true;
				}
				count++;
			}
		}
		//所有反斜线的赢法
		for(let i=0; i<11; i++){
			for(let j=14; j>3; j--){
				for(let k=0; k<5; k++){
					wins[i+k][j-k][count] = true;
				}
				count++;
			}
		}
	
	//我方&敌方赢法统计数组初始化
	for(let i=0; i<count; i++){
		myWin[i] = 0;
		pcWin[i] = 0;
	}
	
	//定义canvas的2d上下文
	let $chess = $('#chess');
	let context = $chess[0].getContext('2d');
	context.strokeStyle = '#BFBFBF';
	context.lineWidth = 1;
	
	//开始绘制水印
	let logo = new Image();
	logo.src = 'img/logo.png';
	logo.onload = function(){
		//如果不加这个onload会导致图片加载不出来
		//原因是当drawImage的时候,图片可能没有加载出来,所以绘制会不成功
		context.drawImage(logo, 0, 0, 450, 450);
		drawChessBoard();
	}
	
	//开始绘制棋盘函数
	function drawChessBoard(){
		//把绘制棋盘封装成一个函数,在logo.onload里调用的好处是:
		//可以避免logo如果在棋盘绘制完后再执行时,logo会覆盖棋盘的问题
		for(let i=0; i<15; i++){
			//横线
			context.moveTo(15, 15+i*30);
			context.lineTo(435, 15+i*30);
			//竖线
			context.moveTo(15+i*30, 15);
			context.lineTo(15+i*30, 435);
		}
		
		context.stroke();
	}
	
	//开始绘制棋子函数
	function oneStep(i, j, me){
		context.beginPath();
		context.arc(15+i*30, 15+j*30, 13, 0, 2*Math.PI);
		context.closePath();
		
			//绘制颜色是一个黑色/白色的渐变
			let gradient = context.createRadialGradient(15+i*30+2, 15+j*30-2, 13, 15+i*30+2, 15+j*30-2, 0);
			if(me){
				//黑棋
				gradient.addColorStop(0, '#0a0a0a');
				gradient.addColorStop(1, '#636766');
			}else{
				//白棋
				gradient.addColorStop(0, '#d1d1d1');
				gradient.addColorStop(1, '#f9f9f9');
			}
			
		context.fillStyle = gradient;
		context.fill();
	}
	
	//落子事件
	$chess.on('click',function(e){
		if( over ){
			return;
		}
		if( !me ){
			//如果是计算机方下棋,我方点击没效果,直接return
			return;
		}
		let x = e.offsetX;
		let y = e.offsetY;
		
		//计算索引(点击的是哪个格子)
		let i = Math.floor(x/30);
		let j = Math.floor(y/30);
		
		if( chessBoard[i][j] == 0 ){
			oneStep(i, j, me);
			chessBoard[i][j] = 1;
			
			//落子时统计赢
			for(let k=0; k<count; k++){
				if( wins[i][j][k] ){
					myWin[k]++;
					pcWin[k] = 6;//表示不可能再赢了
					if( myWin[k] == 5 ){
						alert('你赢了!');
						over = true;
					}
				}
			}
			if( !over ){
				me = !me;
				pcAI();
			}
		}
	});
	
	//计算机落子函数
	function pcAI(){
		let myScore = [];//计算我方得分
		let pcScore = [];
		let max = 0;//用来保存最高分数
		let u = 0,//用来保存最高分数的点坐标
			v = 0;
		for(let i=0; i<15; i++){
			myScore[i] = [];
			pcScore[i] = [];
			for(let j=0; j<15; j++){
				myScore[i][j] = 0;
				pcScore[i][j] = 0;
			}
		}
		
		for(let i=0; i<15; i++){
			for(let j=0; j<15; j++){
				if( chessBoard[i][j] ==0 ){
					for(let k=0; k<count;k++){
						//计算我方
						if( myWin[k] == 1 ){
							myScore[i][j] += 200;
						}else if( myWin[k] == 2 ){
							myScore[i][j] += 400;
						}else if( myWin[k] == 3 ){
							myScore[i][j] += 2000;
						}else if( myWin[k] == 4 ){
							myScore[i][j] += 10000;
						}
						//计算pc方
						if( pcWin[k] == 1 ){
							pcScore[i][j] += 220;
						}else if( pcWin[k] == 2 ){
							pcScore[i][j] += 420;
						}else if( pcWin[k] == 3 ){
							pcScore[i][j] += 2100;
						}else if( pcWin[k] == 4 ){
							pcScore[i][j] += 20000;
						}
					}
				}
				if( myScore[i][j] > max ){
					max = myScore[i][j];
					u = i;
					v = j;
				}else if( myScore[i][j] == max ){
					if( pcScore[i][j] > pcScore[u][v] ){
						u = i;
						v = j;
					}
				}
				if( pcScore[i][j] > max ){
					max = pcScore[i][j];
					u = i;
					v = j;
				}else if( pcScore[i][j] == max ){
					if( myScore[i][j] > myScore[u][v] ){
						u = i;
						v = j;
					}
				}
			}
		}
		oneStep(u, v, false);
		chessBoard[u][v] = 2;
		for(let k=0; k<count; k++){
			if( wins[u][v][k] ){
				pcWin[k]++;
				myWin[k] = 6;//表示不可能再赢了
				if( pcWin[k] == 5 ){
					alert('AI赢了!');
					over = true;
				}
			}
		}
		if( !over ){
			me = !me;
		}
	}
}
/*
 * UI总结:
 * 	棋盘的画法:
 * 		-canvas绘制直线
 * 			moveTo()
 * 			lineTo()
 * 		-设置画笔颜色
 * 			strockStyle
 * 	棋子的画法:
 * 		-canvas画圆
 * 			beginPath
 * 			arc
 * 			closePath
 * 		-如何填充渐变色
 * 			context.createRadialGradient(起始圆x轴,起始圆y轴,起始圆半径,终终止圆x轴,终止圆y轴,终止圆半径)
 * 			.addColorStop()填充颜色
 */
/*
 * AI难点分析:
 * 	赢法数组:用来记录五子棋所有的赢法,三维数组
 * 	每一种赢法的统计数组,一维数组
 * 	如何判断胜负
 * 	计算机落子规则
 */