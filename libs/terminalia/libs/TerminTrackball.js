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
    self.rotationFactor = 1;

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
            self.rot_x += diff_x;
            self.rot_y += diff_y;

            //self.object.rotation.set(0, self.animation_rot + radians(self.rot_x), 0);
            updateRotation();
        }
    }

    function updateRotation() {
        self.object.rotation.set(0, radians(self.rot_x) * self.rotationFactor, 0);
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
}
