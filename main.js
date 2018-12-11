/*

	Fractale de Mandelbrot by Théo Boyer

	Fonctionne assez bien pour un ecran dont le côté maximum est de 400px

	après, fonctionne mais lentement

*/


// on prend une echelle carrée pour ne pas avoir de déformation
let size = Math.max(window.innerWidth, window.innerHeight)

const 
// largeur de l'ecran
WIDTH = size,
// hauteur de l'ecran
HEIGHT = size,
SEUIL_DIVERGENCE = 2,
SEUIL_RETOUR_BAS = 0.000003,
SEUIL_RETOUR_HAUT = 10,
AUTO_ZOOM_FACTOR = 0.05,
SCROLL_ZOOM_FACTOR = 0.1;
let cnv, ctx, scale = 2,
mousepressing = false,
offsetX = 0,
offsetY = 0,
precalc = [],
autozoom = true,
factor = -0.05;

// Lors du chargement de la page
window.addEventListener('load', ()=>{
	cnv = document.getElementById('display')
	// On affecte les variables de largeur et hauteur au canvas
	cnv.width = WIDTH;
	cnv.height = HEIGHT;
	ctx = cnv.getContext('2d');
	// On utilise les evenement pour actualiser le variable mousepressing
	cnv.addEventListener('mousedown', ev=>{
		if(ev.which===1)
			mousepressing = true
	})
	window.addEventListener('mouseup', ev=>{
		if(ev.which===1)
			mousepressing = false
	})
	setup()
})

// Actualisation des variables relatives au déplacement du dessin
window.addEventListener('mousemove', ev=>{
	if(mousepressing) {
		offsetX -= scale * ev.movementX / WIDTH
		offsetY -= scale * ev.movementY / HEIGHT
		draw();
	}
})
// Pareil pour le zoom
window.addEventListener('mousewheel', (ev)=>{
	if(ev.deltaY < 0) {
		scale *= 1 - SCROLL_ZOOM_FACTOR
	} else {
		scale *= 1 + SCROLL_ZOOM_FACTOR
	}
	draw()
})

// Fonction qui retourne la valeur absolue de x
function abs(x) {
	return x < 0 ? -x : x
}
// Fonction qui fait une proportionalité pour une valuer entre un interval de départ et de fin
function map(v, v1, v2, r1, r2) {
	let vr = v2 - v1;
	let rr = r2 - r1;
	let vv = v-v1;
	return r1 + vv * rr / vr;
}

function setup() {
	// On précalcul toutes les valeurs possibles entières pour des couleurs
	for(let i=0; i < 255*3+1; i++) {
		precalc[i] = couleur(i)
	}
	// On dessine la fractale
	draw()
	if(autozoom) {
		// Si autozoom alors un interval appele la fonction de dessin toutes les 50 ms
		setInterval(()=>{
			// Sert a inverser le niveau de zoom si on atteint un certain seuil (sinon on arrive au nivezau des pixels)
			if(scale < SEUIL_RETOUR_BAS) {
				scale = SEUIL_RETOUR_BAS
				factor = AUTO_ZOOM_FACTOR
			} else if(scale > SEUIL_RETOUR_HAUT) {
				scale = SEUIL_RETOUR_HAUT
				factor = -AUTO_ZOOM_FACTOR
			}
			scale*=1+factor
			draw()
		}, 50)
	}
}
// Retourne une couleur pour toute valuer entre 0 et 3*255
function couleur(s) {
	let couleurs = [
		0,0,0
	];
	let i = 0;
	for(let c = 0; c < s; c++) {
		couleurs[i]++
		if(couleurs[i]>=255)
			i++
	}
	// Inverse la couleur
	couleurs[0] = 255 - couleurs[0]
	couleurs[1] = 255 - couleurs[1]
	couleurs[2] = 255 - couleurs[2]
	return {
		r: couleurs[0],
		g: couleurs[1],
		b: couleurs[2]
	}
}

function draw() {
	let imgd = ctx.getImageData(0, 0, WIDTH, HEIGHT);
	// On récupère les pixels de l'image 
	let pixels = imgd.data;
	for(let x=0; x < WIDTH; x++) {
		for(let y=0; y < HEIGHT; y++) {
			// On récupère l'affixe du nombre réel associée aux pixels
			// Tout en prenant en compte le zoom (scale) et le déplacement (offset)
			let a = map(x, 0, WIDTH, -scale + offsetX, scale + offsetX);
			let b = map(y, 0, HEIGHT, -scale + offsetY, scale + offsetY);

			let ca = a;
			let cb = b;

			let z = 0;
			let n = 0;
			//
			for(; n < 100; n++) {
				let aa = a*a - b*b;
				let bb = 2 * a * b;
				// zn+1 = zn + c
				a = aa + ca;
				b = bb + cb;
				// Si la fonction diverge, on arrete tout
				if(abs(a + b) > SEUIL_DIVERGENCE)
					break;

				n++;
			}
			// On récupère la valeur de la couleur précalculée
			let c = precalc[Math.round(map(n, 0, 100, 0, 255*3))];
			// On affecte les valeurs des pixels
			let pix = (x + y * WIDTH) * 4;
			pixels[pix] = c.r;
			pixels[pix + 1] = c.g;
			pixels[pix + 2] = c.b;
			pixels[pix + 3] = 255;
		}
	}
	// On affiche les pixels
	ctx.putImageData(imgd, 0, 0);
}