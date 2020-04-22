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


//setings 
const population_size = 5;
const cube_size = 16;
const gen_size = 8;
var data = fs.readFileSync('in.png'); //input must be 512x512 png


var png  = PNG.sync.read(data);
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



let cube_num = (512/cube_size)*(512/cube_size);
let populations = [];
genalg();



function genalg(){ 

	start();

}



function start(){

	for(let i = 0; i<cube_num;i++) {
		generate();
	}

	while(1){
	data1 = [];
	for(let i = 0; i<cube_num;i++) {
		update(i);
	}
	best.data = [];
	for(let z = 0;z<cube_num;z+=512/cube_size)
		for(let k = 0;k<cube_size;k++)
			for(let i = 0;i<512/cube_size;i++)
				for(let j = 0; j<cube_size*4;j++){
					best.data.push(data1[i+z][j+k*cube_size*4]);
					
				}
	

	create_png(best);
	console.log(fitnessglobal(best.data));
	}
	return 0;
}


function generate(	){

	let population = [];
	for(let j = 0; j<population_size;j++){
		
		let circles =[];
		
		for (var i = 0; i < gen_size; i++) {
			let circle = new Сircle(Math.floor(cube_size*Math.random()),Math.floor(cube_size*Math.random()),Math.floor(cube_size*Math.random()/2),
									[Math.floor(256*Math.random()),Math.floor(256*Math.random()),Math.floor(256*Math.random())]);
			circles.push(circle);
		}
		population.push(circles);
	}
	populations.push(population);
	// let k = 1;
	// while(k>0)
	// {	
	// 	
	// }
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
	let cp = Math.floor((gen_size-1)*Math.random());
	for (var i = 0; i < cp; i++) {
		child1.push(np[0][i]);
		child2.push(np[1][i]);
	}
	for (var i = cp; i < gen_size; i++) {
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
	for (var i = 0; i < gen_size; i++) {
		new_g.push(gen[i]);
	}
	let circle = new Сircle(Math.floor(cube_size*Math.random()),Math.floor(cube_size*Math.random()),Math.floor(cube_size/2*Math.random()),
								[Math.floor(256*Math.random()),Math.floor(256*Math.random()),Math.floor(256*Math.random())]);
	new_g[Math.floor((gen_size-1)*Math.random())] = circle;

	return new_g;
}


function fitness(a,i){
	let b = 0;

		for (var j =  0; j < cube_size; j++) {
				
			for(let k = 0; k< cube_size; k++){
				let g = (Math.abs(a[4*k+j*4*cube_size]-png.data[Math.floor(i/(512/cube_size))*cube_size*2048+j*2048+(i%(512/cube_size))*cube_size*4+k*4]));
				g+=(Math.abs(a[4*k+j*4*cube_size+1]-png.data[Math.floor(i/(512/cube_size))*cube_size*2048+j*2048+(i%(512/cube_size))*cube_size*4+k*4+1]));
				g+=(Math.abs(a[4*k+j*4*cube_size+2]-png.data[Math.floor(i/(512/cube_size))*cube_size*2048+j*2048+(i%(512/cube_size))*cube_size*4+k*4+2]));
				b+=g;
	
			}
		}

	return b;
}



function draw(d){
	let data = [];
	for (var i = 0; i < cube_size*cube_size*4; i++) {
		data.push(255);
	}
	
	
	for(let i =0;i<d.length;i++){
		let c = d[i];
		
		for (var j = 0; j < cube_size; j++) {
			for(let k = 0; k<cube_size;k++){
				if(((k - c.x) * (k - c.x) + (j - c.y) * (j - c.y)) < c.r * c.r){
					data[k*4+j*cube_size*4]=Math.floor((data[k*4+j*cube_size*4]+c.color[0])/2);
					data[(k*4+j*cube_size*4)+1]=Math.floor((data[(k*4+j*cube_size*4)+1]+c.color[1])/2);
					data[(k*4+j*cube_size*4)+2]=Math.floor((data[(k*4+j*cube_size*4)+2]+c.color[2])/2);
				}
			}
		}
	}
	return data;
}


function create_png(image){
	let buffer = PNG.sync.write(image);
		fs.writeFileSync('out.png', buffer); // output file name
}



function fitnessglobal(a){
	let k = 0;
	for (let i = 0; i < a.length; i++) {
		k=k+Math.abs(a[i]-png.data[i]);
	}
	k = (1-(k/(512*512*4*255)))*100;

	return k;
}

