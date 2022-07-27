import "https://cdnjs.cloudflare.com/ajax/libs/particlesjs/2.2.3/particles.min.js";
import { random } from "./random.js"

const colors = [
    ['#0f1c70', '#f2f2f2'],
    ['#d6f2ff', '#87b7ff'],
    ['#eeeeee', '#333333'],
    ['#f65e3b', '#3e0725'],
    ['#c33764', '#1d2671'],
    ['#1cefff', '#364240'],
    ['#212000', '#9eff76'],
    ['#e5e5fd', '#59065f'],
    ['#151019', '#88c8ff'],
    ['#ffeca4', '#ffa500'],
]
function initBackground(selector){
    let randcolor = random.choice(colors);
    document.querySelector(selector).style.background = randcolor[0];
    Particles.init({
      selector: selector,
      color: randcolor[1],
      maxParticles: 250,
      connectParticles: true,
      responsive: [
        {
          breakpoint: 768,
          options: {
            maxParticles: 80
          }
        }, {
          breakpoint: 375,
          options: {
            maxParticles: 50
          }
        }
      ]
    });
}
export { initBackground };