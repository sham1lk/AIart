class Сircle {
  constructor(x, y,r,color) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.color = color;
  }
}
let n = 0;
let fs = require('fs');
let PNG = require('pngjs').PNG;


//settings 
const population_size   = 16;
const square_size 	    = 32;
const chromosome_size   = 20;
const finish_percentage = 99.5;
const input             = 'in.png'
const output            = 'out.png'




var data = fs.readFileSync(input);


var png  = PNG.sync.read(data);			//reading image
var empty = PNG.sync.read(data);
var best = PNG.sync.read(data);
for (var i = 0; i < png.data.length; i++) {
	if(i%4==3)
	png.data[i]=255;
}
for (var i = 0; i < png.data.length; i++){
	empty.data[i]=0;
	if(i%4==3)
		empty.data[i]=255;
}
let data1 = [];



let square_num = (512/square_size)*(512/square_size);
let populations = [];	

start();


function start(){

	let percentage = 0;
	for(let i = 0; i<square_num;i++) {		
		generate();									//generating first population
	}

	while(percentage<finish_percentage){
		data1 = [];
		for(let i = 0; i<square_num;i++) {
			update(i);									//generating new population
		}
		best.data = [];
		for(let z = 0;z<square_num;z+=512/square_size)
			for(let k = 0;k<square_size;k++)							// Combine all parts into one image
				for(let i = 0;i<512/square_size;i++)
					for(let j = 0; j<square_size*4;j++){
						best.data.push(data1[i+z][j+k*square_size*4]);
						
					}
		

		create_png(best);
		percentage =fitnessglobal(best.data);
		console.log(percentage);
	}
	return 0;
}


function generate(){						//generating first population

	let population = [];
	for(let j = 0; j<population_size;j++){
		
		let circles =[];
		
		for (var i = 0; i < chromosome_size; i++) {
			let circle = new Сircle(Math.floor(square_size*Math.random()),Math.floor(square_size*Math.random()),Math.floor(square_size*Math.random()/2),
									[Math.floor(256*Math.random()),Math.floor(256*Math.random()),Math.floor(256*Math.random())]);
			circles.push(circle);
		}
		population.push(circles);
	}
	populations.push(population);
}


function update(i){
	let fit = []
	for (let z = 0; z < populations[i].length; z++) {
		fit.push(fitness(draw(populations[i][z],i),i));
	}
	populations[i] = new_population(populations[i],fit);
}




function new_population(p,f){  
	let min1 = 999999999;
	let min1_i = 0;
	let min2 = 999999999;
	let min2_i =0;
	let new_p = [];

	for (var i = 0; i < population_size; i++) {
		if(f[i]<min1){
			min1 = f[i];
			min1_i = i;
		}
	}
	for (var i = 0; i < population_size; i++) {
		if(f[i]<min2&&f[i]!=min1){
			min2 = f[i];
			min2_i = i;}
	}
	data1.push(draw(p[min1_i]));
	new_p.push(p[min1_i]);
	new_p.push(p[min2_i]);
	crossover(new_p);
	mutation(new_p);
	p = new_p;	
	return new_p;
}


function crossover(np){
	let child1 = [];
	let child2 = [];
	let cp = Math.floor((chromosome_size-1)*Math.random());
	for (var i = 0; i < cp; i++) {
		child1.push(np[0][i]);
		child2.push(np[1][i]);
	}
	for (var i = cp; i < chromosome_size; i++) {
		child1.push(np[1][i]);
		child2.push(np[0][i]);
	}
	np.push(child1);
	np.push(child2);
}


function mutation(np){
	for(let i =0;i<population_size-4;i++){
		np.push(mutate(np[i%3]));
	}
}


function mutate(gen){
	let new_g = [];
	for (var i = 0; i < chromosome_size; i++) {
		new_g.push(gen[i]);
	}
	let circle = new Сircle(Math.floor(square_size*Math.random()),Math.floor(square_size*Math.random()),Math.floor(square_size/2*Math.random()),
								[Math.floor(256*Math.random()),Math.floor(256*Math.random()),Math.floor(256*Math.random())]);
	new_g[Math.floor((chromosome_size)*Math.random())] = circle;

	return new_g;
}


function fitness(a,i){
	let b = 0;

		for (var j =  0; j < square_size; j++) {
				
			for(let k = 0; k< square_size; k++){
				let g = (Math.abs(a[4*k+j*4*square_size]-png.data[Math.floor(i/(512/square_size))*square_size*2048+j*2048+(i%(512/square_size))*square_size*4+k*4]));
				g+=(Math.abs(a[4*k+j*4*square_size+1]-png.data[Math.floor(i/(512/square_size))*square_size*2048+j*2048+(i%(512/square_size))*square_size*4+k*4+1]));
				g+=(Math.abs(a[4*k+j*4*square_size+2]-png.data[Math.floor(i/(512/square_size))*square_size*2048+j*2048+(i%(512/square_size))*square_size*4+k*4+2]));
				b+=g;
	
			}
		}

	return b;
}



function draw(d){
	let data = [];
	for (var i = 0; i < square_size*square_size*4; i++) {
		data.push(255);
	}
	
	
	for(let i =0;i<d.length;i++){
		let c = d[i];
		
		for (var j = 0; j < square_size; j++) {
			for(let k = 0; k<square_size;k++){
				if(((k - c.x) * (k - c.x) + (j - c.y) * (j - c.y)) < c.r * c.r){
					data[k*4+j*square_size*4]=Math.floor((data[k*4+j*square_size*4]+c.color[0])/2);
					data[(k*4+j*square_size*4)+1]=Math.floor((data[(k*4+j*square_size*4)+1]+c.color[1])/2);
					data[(k*4+j*square_size*4)+2]=Math.floor((data[(k*4+j*square_size*4)+2]+c.color[2])/2);
				}
			}
		}
	}
	return data;
}


function create_png(image){
	let buffer = PNG.sync.write(image);
		fs.writeFileSync(output, buffer);
}



function fitnessglobal(a){
	let k = 0;
	for (let i = 0; i < a.length; i++) {
		k=k+Math.abs(a[i]-png.data[i]);
	}
	k = (1-(k/(512*512*4*255)))*100;

	return k;
}

