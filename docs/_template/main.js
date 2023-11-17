title = "Star Destroyer";

description = `Survive!
`;

characters = [
  `   
l    l
lP  Pl  
lPPPPl
lPyyPl
lPPPPl
rr  rr
`,`
ll  ll
ll  ll
cccccc
crrrrc 
cccccc
yy  yy  
`,`
  yy
 yyyy
yyyyyy
yyyyyy
`
  
];

const G = {
	WIDTH: 100,
	HEIGHT: 150,

  PLAYER_FIRE_RATE: 7,
  PLAYER_GUN_OFFSET: 3,

  FBULLET_SPEED: 5,
  ENEMY_MIN_BASE_SPEED: 1.0,
  ENEMY_MAX_BASE_SPEED: 2.0,

  ENEMY_FIRE_RATE: 45,

  EBULLET_SPEED: 2.0,
  EBULLET_ROTATION_SPD: 0.1
  
};


options = {
  theme: "dark",
  viewSize: {x: G.WIDTH, y: G.HEIGHT}
};


 /**
* @typedef {{
* pos: Vector,
* speed: number
* }} Star
*/

/**
* @type  { Star [] }
*/
let stars;

/**
 * @typedef {{
* pos: Vector,
* firingCooldown: number,
* isFiringLeft: boolean
* }} Player
*/

/**
* @type { Player }
*/
let player;

/**
* @typedef {{
* pos: Vector
* }} FBullet
*/

/**
* @type { FBullet [] }
*/
let fBullets;


/**
 * @typedef {{
 * pos: Vector,
 * firingCooldown: number
 * }} Enemy
 */

/**
 * @type { Enemy [] }
 */
let enemies;

/**
 * @typedef {{
 * pos: Vector,
 * angle: number,
 * rotation: number
 * }} EBullet
 */

/**
 * @type { EBullet [] }
 */
let eBullets;

/**
 * @type { number }
 */
let currentEnemySpeed;

/**
 * @type { number }
 */
let waveCount;

/**
 * 
 */





function update() {
  
  if (!ticks) {
    // A CrispGameLib function
    // First argument (number): number of times to run the second argument
    // Second argument (function): a function that returns an object. This
    // object is then added to an array. This array will eventually be
    // returned as output of the times() function.
    enemies = [];

    waveCount = 0;
    currentEnemySpeed = 0;
    
    // Another update loop
    // This time, with remove()
    
    

stars = times(20, () => {
        // Random number generator function
        // rnd( min, max )
        const posX = rnd(0, G.WIDTH);
        const posY = rnd(0, G.HEIGHT);
        // An object of type Star with appropriate properties
        return {
          // Creates a Vector
            pos: vec(posX, posY),
            // More RNG
            speed: rnd(0.5, 1.0)
        };
    });

    player = {
      pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
            firingCooldown: G.PLAYER_FIRE_RATE,
            isFiringLeft: true
  };
    fBullets = [];
    eBullets = [];
    
}


if (enemies.length === 0) {
  currentEnemySpeed =
      rnd(G.ENEMY_MIN_BASE_SPEED, G.ENEMY_MAX_BASE_SPEED) * difficulty;
  for (let i = 0; i < 9; i++) {
      const posX = rnd(0, G.WIDTH);
      const posY = -rnd(i * G.HEIGHT * 0.1);
      enemies.push({
          pos: vec(posX, posY),
          firingCooldown: G.ENEMY_FIRE_RATE 
      });
  }

  waveCount++; // Increase the tracking variable by one
}

player.pos = vec(input.pos.x, input.pos.y);
player.pos.clamp(0, G.WIDTH, 0, G.HEIGHT);
// Cooling down for the next shot
player.firingCooldown--;
// Time to fire the next shot
if (player.firingCooldown <= 0) {
  // Get the side from which the bullet is fired
  const offset = (player.isFiringLeft)
      ? -G.PLAYER_GUN_OFFSET
      : G.PLAYER_GUN_OFFSET;
  // Create the bullet
  fBullets.push({
      pos: vec(player.pos.x + offset, player.pos.y)
  });
  // Reset the firing cooldown
  player.firingCooldown = G.PLAYER_FIRE_RATE;
  // Switch the side of the firing gun by flipping the boolean value
  player.isFiringLeft = !player.isFiringLeft;
}
color ("black");
char("a", player.pos);
//text(fBullets.length.toString(), 3, 10);
remove(fBullets, (fb) => {
  const isCollidingWithEnemies = box(fb.pos, 2).isColliding.char.b;
  return (isCollidingWithEnemies || fb.pos.y < 0);
});
// Updating and drawing bullets
fBullets.forEach((fb) => {
    // Move the bullets upwards
    fb.pos.y -= G.FBULLET_SPEED;
    
    // Drawing
    color("cyan");
    box(fb.pos, 2);
});


  stars.forEach((s) => {
    // Move the star downwards
    s.pos.y += s.speed;
    // Bring the star back to top once it's past the bottom of the screen
    s.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);

    // Choose a color to draw
    color("light_purple");
    // Draw the star as a square of size 1
    box(s.pos, 1);
});

remove(enemies, (e) => {
  e.pos.y += currentEnemySpeed;
  e.firingCooldown--;
  if (e.firingCooldown <= 0) {
      eBullets.push({
          pos: vec(e.pos.x, e.pos.y),
          angle: e.pos.angleTo(player.pos),
          rotation: rnd()
      });
      e.firingCooldown = G.ENEMY_FIRE_RATE;
      play("select");
  }

  color("black");
  // Interaction from enemies to fBullets
  // Shorthand to check for collision against another specific type
  // Also draw the sprits
  const isCollidingWithFBullets = char("b", e.pos).isColliding.rect.cyan;
  const isCollidingWithPlayer = char("b", e.pos).isColliding.char.a;
  if (isCollidingWithPlayer) {
      end();
      play("powerUp");
  }
  
  if (isCollidingWithFBullets) {
      color("yellow");
      particle(e.pos);
      play("explosion");
      addScore(10 * waveCount, e.pos);
  }
  
  // Also another condition to remove the object
  return (isCollidingWithFBullets || e.pos.y > G.HEIGHT);
});




remove(fBullets, (fb) => {
  // Interaction from fBullets to enemies, after enemies have been drawn
  color("cyan");
  const isCollidingWithEnemies = box(fb.pos, 2).isColliding.char.b;
  return (isCollidingWithEnemies || fb.pos.y < 0);
});

remove(eBullets, (eb) => {
  // Old-fashioned trigonometry to find out the velocity on each axis
  eb.pos.x += G.EBULLET_SPEED * Math.cos(eb.angle);
  eb.pos.y += G.EBULLET_SPEED * Math.sin(eb.angle);
  // The bullet also rotates around itself
  eb.rotation += G.EBULLET_ROTATION_SPD;

  color("red");
  const isCollidingWithPlayer
      = char("c", eb.pos, {rotation: eb.rotation}).isColliding.char.a;

  if (isCollidingWithPlayer) {
      // End the game
      end();
      play("powerUp");
  }

  const isCollidingWithFBullets
      = char("c", eb.pos, {rotation: eb.rotation}).isColliding.rect.yellow;
  if (isCollidingWithFBullets) addScore(1, eb.pos);
  
  // If eBullet is not onscreen, remove it
  return (!eb.pos.isInRect(0, 0, G.WIDTH, G.HEIGHT));
});

}
