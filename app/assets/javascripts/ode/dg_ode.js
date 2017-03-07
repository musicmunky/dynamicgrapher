// LINKS TO LOOK AT FOR IMPLEMENTATION OF ODE JAVASCRIPT

// http://tutorial.math.lamar.edu/Classes/DE/EulersMethod.aspx
// http://mtdevans.com/2013/05/fourth-order-runge-kutta-algorithm-in-javascript-with-demo/
// http://stackoverflow.com/questions/29830807/runge-kutta-problems-in-js
// http://codeflow.org/entries/2010/aug/28/integration-by-example-euler-vs-verlet-vs-runge-kutta/

// 2nd order runge kutta:
// http://keisan.casio.com/exec/system/1392171606



// Converted from Python version: http://doswa.com/2009/01/02/fourth-order-runge-kutta-numerical-integration.html
function rk4(x, v, a, dt) {
    // Returns final (position, velocity) array after time dt has passed.
    //        x: initial position
    //        v: initial velocity
    //        a: acceleration function a(x,v,dt) (must be callable)
    //        dt: timestep
    var x1 = x;
    var v1 = v;
    var a1 = a(x1, v1, 0);

    var x2 = x + 0.5*v1*dt;
    var v2 = v + 0.5*a1*dt;
    var a2 = a(x2, v2, dt/2);

    var x3 = x + 0.5*v2*dt;
    var v3 = v + 0.5*a2*dt;
    var a3 = a(x3, v3, dt/2);

    var x4 = x + v3*dt;
    var v4 = v + a3*dt;
    var a4 = a(x4, v4, dt);

    var xf = x + (dt/6)*(v1 + 2*v2 + 2*v3 + v4);
    var vf = v + (dt/6)*(a1 + 2*a2 + 2*a3 + a4);

    return [xf, vf];
}