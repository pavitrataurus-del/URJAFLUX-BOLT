function getRot(startX, startY, currentX, currentY, startRot) {
    let startAngleRad = Math.atan2(startY, startX);
    let startAngleDeg = (startAngleRad * 180) / Math.PI;

    let currentAngleRad = Math.atan2(currentY, currentX);
    let currentAngleDeg = (currentAngleRad * 180) / Math.PI;

    let deltaAngle = currentAngleDeg - startAngleDeg;
    while (deltaAngle < -180) deltaAngle += 360;
    while (deltaAngle > 180) deltaAngle -= 360;

    let newRotation = (startRot + deltaAngle) % 360;
    if (newRotation < 0) newRotation += 360;
    return newRotation;
}
console.log(getRot(0, -1, 1, 0, 0)); // dragged 90 deg clockwise
