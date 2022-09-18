// Declare all the common objects used as variables for conveniance
const b2Vec2  = Box2D.Common.Math.b2Vec2;
const b2BodyDef = Box2D.Dynamics.b2BodyDef;
const b2Body = Box2D.Dynamics.b2Body;
const b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
const b2World = Box2D.Dynamics.b2World;
const b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
const b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
const b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
const b2revoluteJoinDef = Box2D.Dynamics.Joints.b2RevoluteJointDef;

let world;
// 30 pixels on our canvas correspond to 1 meter in the box2d world
const scale = 30;



function  init() {
  // Set up the Box2d World that will do most of the physics calculation
  let gravity = new b2Vec2(0, 9.8); // Declare gravity as 9.8 m/s^2 downwards parameters x and y
  // Allow objects that are at rest to fall asleep and to be excluded from calculation
  const allowSleep = true;

  world = new b2World(gravity, allowSleep);
  createFloor();

  // Create some bodies with simple shapes
  createRectangularBody();
  createCircularBody();
  createSimplePolygonBody();
  createComplexBody();

  // Join two bodies combining two shapes
  createRevoluteJoint();
  // Create a body with a special user Data
  createSpecialBody();

  // create contact listener and track events
  listenForContact();

  setupDebugDraw();

  // Start the Box2d animation loop
  animate();
}


// Box2d used the metric system


/**
 * ADDING OUR FIRST BODY: THE FLOOR
 * b2BodyDef -> contain the position of the body and the type of the body static or dynamic
 * static: not affected by collision and gravity
 * dynamic: is affected by extenal force and will react accordingly -> fall, roll, bounce
 *
 * b2FixtureDef -> This is used to attach a shape to the body contains info like density, friction coefficient
 * and the coefficient of restitution
 *
 * Two type of fixture Definition -> b2PolygonShape and b2CircleShape
 *
 */

function createFloor() {
  // A body definition holds all the data needed to construct a rigid body
  const bodyDef = new b2BodyDef;
  bodyDef.type = b2Body.b2_staticBody;
  bodyDef.position.x = 640 / 2 / scale;
  bodyDef.position.y = 450 / scale;
  // A fixture is used to attach a shape to a body for collision detection
  // A fixture definition is used to create a fixture

  const fixtureDef = new b2FixtureDef;

  fixtureDef.density = 1.0;
  fixtureDef.friction = 0.5;
  fixtureDef.restitution = 0.2;

  fixtureDef.shape = new b2PolygonShape;
  fixtureDef.shape.SetAsBox(320 / scale, 10 / scale); // 640 pixels wide and 20 pixels tall

  const body = world.CreateBody(bodyDef);
  const fixture = body.CreateFixture(fixtureDef);
}

/**
 * Note:
 * The origin of a object is at it's center when you call SetAsBox()
 *
 * The higher the coefficient of restitution become the bouncier it becomes. Value close to 0 means
 * that the body will not bounce and will lose most of its momentum in a collision (Called an inelastic collision)
 * Value close to 1 means that the body will bounce as fast as it came  and retain most of its momentum (Called and elastic collision)
 *
 *
 */


/**
 * DRAWING THE WORLD: SETTING UP DEBUG DRAWING
 * Box2d is primarily meant to be a physic engine. We are responsible to handle drawing ourselves
 * However there is a simple methode to test our code physics DrawDebugData()
 *
 */

let context;

function setupDebugDraw() {
  context = document.getElementById("canvas").getContext("2d");

  const debugDraw = new b2DebugDraw();

  // Use this canvas context for drawing the dubugging screen
  debugDraw.SetSprite(context);
  // Set the Scale
  debugDraw.SetDrawScale(scale);
  // Fill boxes with an alpha transparency of 0.3
  debugDraw.SetFillAlpha(0.3);
  // Draw lines with a thickness of 1
  debugDraw.SetLineThickness(1.0);
  // Display all shapes and joints
  debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);

  // Start using debug draw in our world
  world.SetDebugDraw(debugDraw);

}

/**
 * ANIMATING THE WORLD
 * run the simulation with world.Step()
 * draw the image  with world.DrawDebugData()
 * clear any force that we have applied using world.ClearForces()
 */


const timeStep = 1 / 60;

// As per the Box2d manual, the suggested iteration count for Box2d is 8 for velocity and 3 for position

const velocityIterations = 8;
const positionIterationS = 3;


function animate() {
  world.Step(timeStep, velocityIterations, positionIterationS);
  world.ClearForces();

  world.DrawDebugData();
  if (specialBody) {
    drawSpecialBody();
  }
  // Kill special body if Dead
  if (specialBody && specialBody.GetUserData().life <= 0) {
    world.DestroyBody(specialBody);
    specialBody = undefined;
    console.log("The special body was destroyed")
  }

  setTimeout(animate, timeStep);
}


/**
 * ADDING MORE BOX2D ELEMENTS.
 * elements -> simple body, complex body, joints, contacts listeners
 * simple body: rectangular , circular  or polygon shaped
 * Complex body: combine multiple shapes
 * Joints: connect multiple bodies
 * Contact listeners: handle collision events
 */


function createRectangularBody() {
  const bodyDef = new b2BodyDef;
  bodyDef.type = b2Body.b2_dynamicBody;
  bodyDef.position.x = 40 / scale;
  bodyDef.position.y = 100 / scale;

  const fixtureDef = new b2FixtureDef;
  fixtureDef.density =1.0;
  fixtureDef.friction = 0.5;
  fixtureDef.restitution = 0.3;

  fixtureDef.shape = new b2PolygonShape;
  fixtureDef.shape.SetAsBox(30 / scale, 50 / scale);
  const body = world.CreateBody(bodyDef);
  const fixture = body.CreateFixture(fixtureDef);
}


function createCircularBody() {

  const bodyDef = new b2BodyDef;

  bodyDef.type = b2Body.b2_dynamicBody;
  bodyDef.position.x = 130 / scale;
  bodyDef.position.y = 100 / scale;

  const fixtureDef = new b2FixtureDef;
  fixtureDef.density =1.0;
  fixtureDef.friction = 0.5;
  fixtureDef.restitution = 0.7;

  fixtureDef.shape = new b2CircleShape(30 / scale);

  const body = world.CreateBody(bodyDef);
  const fixture = body.CreateFixture(fixtureDef);
}


function createSimplePolygonBody() {
  const bodyDef = new b2BodyDef;

  bodyDef.type = b2Body.b2_dynamicBody;
  bodyDef.position.x = 230 / scale;
  bodyDef.position.y = 50 / scale;

  const fixtureDef = new b2FixtureDef;

  fixtureDef.density =1.0;
  fixtureDef.friction = 0.5;
  fixtureDef.restitution = 0.6;

  fixtureDef.shape = new b2PolygonShape;
  // Create an array of b2Vec2 points in clockwise direction
  const points = [
    new b2Vec2(0,0),
    new b2Vec2(40 / scale, 50 / scale),
    new b2Vec2(50 / scale, 100 / scale),
    new b2Vec2(-50 / scale, 100 / scale),
    new b2Vec2(-40 / scale, 50 / scale),
  ];

  // Use SetArray() to define the shape using the points array
  fixtureDef.shape.SetAsArray(points, points.length);

  const body = world.CreateBody(bodyDef);
  const fixture = body.CreateFixture(fixtureDef);
}

function createComplexBody() {
  const bodyDef = new b2BodyDef;

  bodyDef.type = b2Body.b2_dynamicBody;
  bodyDef.position.x = 350 / scale;
  bodyDef.position.y = 50 / scale;
  let body = world.CreateBody(bodyDef);

  // Create the first fixture and attach a circular shape to the body
  let fixtureDef = new b2FixtureDef;

  fixtureDef.density = 1.0;
  fixtureDef.friction = 0.5;
  fixtureDef.restitution = 0.7;

  fixtureDef.shape = new b2CircleShape(40 / scale);
  body.CreateFixture(fixtureDef);

  fixtureDef.shape = new b2PolygonShape;
  const points = [
    new b2Vec2(0,0),
    new b2Vec2(40 / scale, 50 / scale),
    new b2Vec2(50 / scale, 100 / scale),
    new b2Vec2(-50 / scale, 100 / scale),
    new b2Vec2(-40 / scale, 50 / scale),
  ];
  fixtureDef.shape.SetAsArray(points, points.length);
  body.CreateFixture(fixtureDef);
}

/**
 *  Connecting Bodies with joints
 */

function  createRevoluteJoint() {
  // Define the first body
  const bodyDef1 = new b2BodyDef;

  bodyDef1.type = b2Body.b2_dynamicBody;
  bodyDef1.position.x = 480 / scale;
  bodyDef1.position.y = 50 / scale;

  const body1 = world.CreateBody(bodyDef1);

  // create the first fixture and attach to the body
  let fixtureDef1 = new b2FixtureDef;

  fixtureDef1.density = 1.0;
  fixtureDef1.friction = 0.5;
  fixtureDef1.restitution = 0.5;
  fixtureDef1.shape = new b2PolygonShape;

  fixtureDef1.shape.SetAsBox(50 / scale, 10 / scale);

  body1.CreateFixture(fixtureDef1);

  // Define the second body
  const bodyDef2 = new b2BodyDef;

  bodyDef2.type = b2Body.b2_dynamicBody;
  bodyDef2.position.x = 470 / scale;
  bodyDef2.position.y = 50 / scale;

  const body2 = world.CreateBody(bodyDef2);

  // create the second fixture and attach a polygon shape  to the body
  let fixtureDef2 = new b2FixtureDef;

  fixtureDef2.density = 1.0;
  fixtureDef2.friction = 0.5;
  fixtureDef2.restitution = 0.5;
  fixtureDef2.shape = new b2PolygonShape;

  const points = [
    new b2Vec2(0,0),
    new b2Vec2(40 / scale, 50 / scale),
    new b2Vec2(50 / scale, 100 / scale),
    new b2Vec2(-50 / scale, 100 / scale),
    new b2Vec2(-40 / scale, 50 / scale),
  ];

  fixtureDef2.shape.SetAsArray(points, points.length);
  body2.CreateFixture(fixtureDef2);

  // create a joint between body1 and body2
  const joinDef = new b2revoluteJoinDef;
  const jointCenter =  new b2Vec2(470 / scale, 50 / scale);
  joinDef.Initialize(body1, body2, jointCenter);
  world.CreateJoint(joinDef);
}


/**
 * TRACKING COLLISIONS AND DAMAGE
 * SetUserData() and GetUserData() allow to add any object as custom property to a body
 *Contact Listeners 4 events
 * BeginContact(): Called when two fixture begin to touch
 * EndContact(): Called when two fixture cease to touch
 * PostSolve(): Lets us inspect a contact after the solver is finished.
 * this is useful for inspecting impulse
 * PreSolve():Lets us inspect a contact before it goes to the solver
 */

let specialBody;
function createSpecialBody() {
  const bodyDef = new b2BodyDef;

  bodyDef.type = b2Body.b2_dynamicBody;
  bodyDef.position.x = 450 / scale;
  bodyDef.position.y = 0 / scale;

  specialBody = world.CreateBody(bodyDef);
  specialBody.SetUserData({name: "special", life: 250});

  // Create a fixture to attach a circular shape to the body
  const fixtureDef = new b2FixtureDef;
  fixtureDef.density =1.0;
  fixtureDef.friction = 0.5;
  fixtureDef.restitution = 0.7;

  fixtureDef.shape = new b2CircleShape(30 / scale);


  const fixture = specialBody.CreateFixture(fixtureDef);
}

function listenForContact() {
  const listener = new Box2D.Dynamics.b2ContactListener;

  listener.PostSolve = function (contact, impulse) {
    const body1 = contact.GetFixtureA().GetBody();
    const body2 = contact.GetFixtureB().GetBody();

    // If either of the bodies is the special body, reduce its life
    if (body1 == specialBody || body2 == specialBody) {
      const impulseAlongNormal = impulse.normalImpulses[0];
      specialBody.GetUserData().life -= impulseAlongNormal;
      console.log("The special body was in collision with impulse", impulseAlongNormal,
        "and its life has now become", specialBody.GetUserData().life);
    }
  }
  world.SetContactListener(listener);
}


/**
 * DRAWING OUR OWN CHARACTERS
 * every b2Body object has two methods GetPosition() and GetAngle.
 * it provides the coordinate and the angle of the body.
 *
 */

function drawSpecialBody() {
  // Get body position and angle
  const position = specialBody.GetPosition();
  const angle = specialBody.GetAngle();

  // Translate and rotate axis to body position and angle
  context.translate(position.x * scale, position.y * scale);
  context.rotate(angle);

  // Draw a filled circular face
  context.fillStyle = "rgb(200, 150, 250)";
  context.beginPath();
  context.arc(0, 0, 30, 0, 2 * Math.PI, false);
  context.fill();

  // Draw two rectangular eyes
  context.fillStyle = "rgb(255, 255, 255)";
  context.fillRect(-15, -15, 10, 5);
  context.fillRect(5, -15, 10, 5);

  // Draw an upward or downward arc for a smile depending on life

  context.strokeStyle = "rgb(255, 255, 255)";
  context.beginPath();
  if (specialBody.GetUserData().life > 100) {
    context.arc(0,0, 10, 2 * Math.PI, true);
  } else {
    context.arc(0,10, 10, 2 * Math.PI, false);
  }
  context.stroke();

  // Translate and rotate axis back to original position and angle
  context.rotate(-angle);
  context.translate(-position.x * scale, -position.y * scale);
}


















































