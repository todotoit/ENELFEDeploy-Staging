/**
 * CREATED BY L. H. Zanconi
 * A SIMPLE ARCBALL IMPLEMENTATION BY MAPPING MOUSE X,Y TO X,Y AXIS ROTATIONS
 */
window.TERMINALIA = window.TERMINALIA || {};

TERMINALIA.Trackball = function Trackball() {

    var self = this;
    self.last_x = 0;
    self.last_y = 0;
    self.rot_x = 0;
    self.rot_y = 0;
    self.object = null;
    self.leftPressed = false;
    self.offset = 0;
    self.enabled = true;
    self.rotationFactor = 0.2;
    self.currentAngle = 0.0;
    self.targetRot = 0.0;
    self.autoRotate = false;
    self.pinInterpolating = false;

    function onMouseDown(x, y) {
        self.leftPressed = true;
        self.last_x = x;
        self.last_y = y;
    }

    function onMouseUp() {
        self.leftPressed = false;
    }

    function onMouseMove(x, y) {
        var diff_x = x - self.last_x;
        var diff_y = y - self.last_y;
        self.last_x = x;
        self.last_y = y;

        if (self.leftPressed && self.enabled) {
            self.rot_y += diff_y;
            self.currentAngle += diff_x;

            //If world has turned around 360 degress on the left reset currentAngle to zero
            if ((radians(self.currentAngle) * self.rotationFactor) < -(radians(360))) {
                self.currentAngle = 0;
            }

            //If world has turned around 360 degress on the right reset currentAngle to zero
            if ((radians(self.currentAngle) * self.rotationFactor) > radians(360)) {
                self.currentAngle = 0;
            }

            updateRotation();
        }
    }

    function updateRotation() {
        self.object.rotation.set(0, radians(self.currentAngle) * self.rotationFactor, 0);
    }

    function updateRotationPin() {
        if (self.pinInterpolating) {
            var diff = Math.floor(self.currentAngle) - Math.floor(self.targetRot);
            if (diff > 1 || diff < -1) {
                self.currentAngle += (self.targetRot - self.currentAngle) * 0.03;
                self.object.rotation.set(0, radians(self.currentAngle) * self.rotationFactor, 0);
            }
            else {
                self.pinInterpolating = false;
            }

            //console.log("Interpolating...");
        }
    }

    function autoRotateAnimation() {
        if (self.autoRotate) {
            self.currentAngle += 1;
            
            //If world has turned around 360 degress on the left reset currentAngle to zero
            if ((radians(self.currentAngle) * self.rotationFactor) < -(radians(360))) {
                self.currentAngle = 0;
            }

            //If world has turned around 360 degress on the right reset currentAngle to zero
            if ((radians(self.currentAngle) * self.rotationFactor) > radians(360)) {
                self.currentAngle = 0;
            }

            //console.log("Autorotate", self.currentAngle);
            self.object.rotation.set(0, radians(self.currentAngle) * self.rotationFactor, 0);
        }
    }

    function addRotationToObject(object) {
        self.object = object;
    }

    function radians(degrees) {
        return degrees * Math.PI / 180;
    }

    self.onMouseDown = onMouseDown;
    self.onMouseUp = onMouseUp;
    self.onMouseMove = onMouseMove;
    self.addRotationToObject = addRotationToObject;
    self.updateRotation = updateRotation;
    self.updateRotationPin = updateRotationPin;
    self.autoRotateAnimation = autoRotateAnimation;
}
