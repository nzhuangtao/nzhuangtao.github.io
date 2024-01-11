class Effect {
    STACK_SCALE = 10
    SHUTTER_COUNT = 5;
    LASER_SCALE = 30;
    TOOTH_COUNT = 6;
    UNCOVER_SIZE = 50;
    devicePixelRadio = window.devicePixelRatio || 1;
    constructor(options) {
        this.defaultOptions = {
            duration: 1000,
            easeType: 'linear',
            effectType: 'topLaser',
            width: 600,
            height: 400
        };
        this.isReady = false;
        this.width = 0;
        this.height = 0;
        this.progress = 0;
        this.currentProgress = 0;
        this.start = 0;

        this.raf = null; // 动画事件句柄
        this.helper = null;
        this.helperCtx = null;
        this.helper2 = null;
        this.helperCtx2 = null;

        this.image = null;
        this.options = {};
        for (let key in this.defaultOptions) {
            if (options[key]) {
                this.options[key] = options[key];
            } else {
                this.options[key] = this.defaultOptions[key]
            }
        };
        this.canvas = document.querySelector('#canvas');
        this.ctx = null;
    }
    init() {
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            let { width, height } = this.options;
            this.width = width;
            this.height = height;
            const { RW, RH } = this.getRatioSize(this.width, this.height)
            this.RW = RW;
            this.RH = RH;
            this.canvas.width = RW;
            this.canvas.height = RH;
            this.canvas.style.width = this.width + 'px';
            this.canvas.style.height = this.height + 'px';
            let image = new Image();
            image.src = '../images/effectDemo.png';
            image.onload = () => {
                this.image = image;
                this.ctx.drawImage(this.image, 0, 0, this.RW, this.RH);
                this.settingHelper();
            }
        };
    }
    toggleAnimation(effectName) {
        this.end();
        this.options.effectType = effectName;
        this.settingHelper();
        this.play();
    }
    settingHelper() {
        if (this.helper) {
            this.helper = null;
            this.helperCtx = null;
        }
        let { effectType } = this.options;
        let _width = this.width;
        let _height = this.height;
        switch (effectType) {
            case 'stackInTop':
            case 'stackInBottom':
                _height = this.RH * this.STACK_SCALE;
                break;
            case 'stackInLeft':
            case 'stackInRight':
                _width = this.RW * this.STACK_SCALE;
                break;
            case 'topLaser':
            case 'bottomLaser':
                _height = this.RH * this.LASER_SCALE
                break;
            case 'leftLaser':
            case 'rightLaser':
                _width = this.RW * this.LASER_SCALE
            case 'h_uncover':
            case 'v_uncover':
                this.helper2 = this.createCanvas(_width, _height);
                this.helperCtx2 = this.helper2.getContext('2d')
                break;
            default:
                break;
        }
        this.helper = this.createCanvas(_width, _height)
        this.helperCtx = this.helper.getContext('2d')
    }
    play() {
        if (!this.image)
            return 0;
        if (this.raf) {
            console.log('重置')
            this.end();
        };
        this.start = performance.now();
        this.raf = requestAnimationFrame(this.animate.bind(this));
        return this;
    }
    end() {
        this.progress = 0;
        this.currentProgress = 0;
        cancelAnimationFrame(this.raf);
        this.raf = null;
    }
    pause() {
        this.currentProgress = this.progress;
        cancelAnimationFrame(this.raf);
        this.raf = null;
    }
    resume() {
        if (!this.image)
            return 0;
        this.end();
        this.play();
    }
    animate(time) {
        this.progress = ((time - this.start) / this.options.duration) + this.currentProgress;
        this.progress = linear(this.progress)
        if (this.progress > 1)
            this.progress = 1;
        if (this.progress > 0) {
            switch (this.options.effectType) {
                case 'stackInTop':
                    this.stackInTop();
                    break;
                case 'stackInBottom':
                    this.stackInBottom();
                    break;
                case 'stackInLeft':
                    this.stackInLeft();
                    break;
                case 'stackInRight':
                    this.stackInRight();
                    break;
                case 'shutter':
                    this.shutter();
                    break;
                case 'topLaser':
                    this.topLaser();
                    break;
                case 'bottomLaser':
                    this.bottomLaser();
                    break;
                case 'leftLaser':
                    this.leftLaser();
                    break;
                case 'rightLaser':
                    this.rightLaser();
                    break;
                case 'wheel':
                    this.animateWheel();
                    break;
                case 'tooch':
                    this.animateTooth();
                    break;
                case "zoomFullScreen":
                    this.animateZoomFullScreen();
                    break;
                case 'h_uncover':
                case 'v_uncover':
                    this.uncover();
                    break;
                case 'h_shutter':
                case 'v_shutter':
                    this.shutter();
                    break;
                default:
                    break;
            }
        };
        this.raf = requestAnimationFrame(this.animate.bind(this));
        if (this.progress == 1) {
            this.end();
        };
    }
    async loadImage(image) {
        let res = await this._loadImage(image);
        this.image = res;
        this.ctx.drawImage(this.image, 0, 0, this.RW, this.RH);
        this.settingHelper();
    }
    _loadImage(image) {
        return new Promise((resolve) => {
            const reader = new FileReader()
            reader.readAsDataURL(image)
            reader.onload = function (event) {
                const img = new Image()
                img.src = event.target.result;
                resolve(img);
            }
        })
    }
    getRatioSize(width, height) {
        const ratio = this.devicePixelRadio / 1
        return {
            RW: (width * ratio) | 0,
            RH: (height * ratio) | 0
        }
    }
    createCanvas(width, height) {
        const canvas = document.createElement('canvas');
        const { RW, RH } = this.getRatioSize(width, height)
        canvas.width = RW;
        canvas.height = RH;
        canvas.style.width = width + 'px'
        canvas.style.height = height + 'px'
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.image, 0, 0, RW, RH)
        return canvas;
    }
    getRevertImageData(source, target) {
        for (let i = 0, h = source.height; i < h; i++) {
            for (let j = 0, w = source.width; j < w; j++) {
                target.data[i * w * 4 + j * 4 + 0] = source.data[(h - i) * w * 4 + j * 4 + 0]
                target.data[i * w * 4 + j * 4 + 1] = source.data[(h - i) * w * 4 + j * 4 + 1]
                target.data[i * w * 4 + j * 4 + 2] = source.data[(h - i) * w * 4 + j * 4 + 2]
                target.data[i * w * 4 + j * 4 + 3] = source.data[(h - i) * w * 4 + j * 4 + 3]
            }
        }
        return target
    }
    animateTooth() {
        const perWidth = Math.ceil(this.RW / this.TOOTH_COUNT);
        this.ctx.clearRect(0, 0, this.RW, this.RH)
        for (let i = 0; i < this.TOOTH_COUNT; i++) {
            const x = i * perWidth
            const h = this.progress * this.RH
            if (h < 1) {
                continue
            }
            let getY, y;
            if (i % 2 === 0) {
                getY = 0;
                y = this.RH - h
            }
            else {
                getY = this.RH - h;
                y = 0
            }
            const imageData = this.helperCtx.getImageData(x, getY, perWidth, h)
            this.ctx.putImageData(imageData, x, y)
        }
    }
    uncover() {
        const sourceData = this.helperCtx.getImageData(0, 0, this.RW, this.RH)
        const targetData = this.helperCtx.getImageData(0, 0, this.RW, this.RH)
        const vImageData = this.getRevertImageData(sourceData, targetData)
        this.helperCtx2.putImageData(vImageData, 0, 0)
        let effectType = this.options.effectType;

        this.ctx.clearRect(0, 0, this.RW, this.RH)
        const h = this.progress * this.RH
        const isFromTop = effectType == 'h_uncover' ? true : false;
        let y1;
        if (isFromTop) {
            y1 = this.RH - h - this.UNCOVER_SIZE;
        } else {
            y1 = (h + this.UNCOVER_SIZE)
        };
        y1 = Math.max(0, Math.min(y1, this.RH - this.UNCOVER_SIZE))
        const imageData = this.helperCtx2.getImageData(0, y1, this.RW, this.UNCOVER_SIZE)
        this.ctx.putImageData(imageData, 0, isFromTop ? h - 1 : this.RH - h - this.UNCOVER_SIZE + 1)
        if (h >= 1) {
            const mainData = this.helperCtx.getImageData(0, isFromTop ? 0 : this.RH - h, this.RW, h)
            this.ctx.putImageData(mainData, 0, isFromTop ? 0 : this.RH - h + 1)
        }
    }
    animateWheel() {

        const pattern = this.ctx.createPattern(this.helper, 'no-repeat')
        const radius = Math.sqrt((Math.pow(this.RW, 2) + Math.pow(this.RH, 2))) / 2;
        this.ctx.fillStyle = pattern;
        const PI2 = Math.PI * 2
        const sAngle = Math.PI / -2
        this.ctx.clearRect(0, 0, this.RW, this.RH);

        this.ctx.beginPath()
        this.ctx.moveTo(this.RW / 2, this.RH / 2)
        const eAngle = PI2 * this.progress - Math.PI / 2
        this.ctx.arc(this.RW / 2, this.RH / 2, radius, sAngle, eAngle, false)
        this.ctx.fill()
    }
    animateZoomFullScreen() {
        this.ctx.clearRect(0, 0, this.RW, this.RH);
        const helfWidth = this.RW / 2;
        const w = this.progress * helfWidth
        const h = this.RH * this.progress;

        const rightX = helfWidth
        const rightY = this.RH - h;

        const rightImageData = this.helperCtx.getImageData(this.RW - w, 0, w + 1, h + 1);
        this.ctx.putImageData(rightImageData, rightX, rightY);
        const leftX = helfWidth - this.progress * helfWidth
        const leftY = this.RH - h
        const leftImageData = this.helperCtx.getImageData(0, 0, w + 1, h + 1)
        this.ctx.putImageData(leftImageData, leftX, leftY)
    }
    stackInTop() {
        let w = this.helper.width;
        let h = this.helper.height;

        let SW = w // helper虚拟像素宽度
        let SH = h // helper虚拟像素高度
        const isHorizontal = SW > this.RW
        const isVertical = SH > this.RH

        this.ctx.clearRect(0, 0, this.RW, this.RH)
        let sx, sy, sw, sh, dx, dy, dw, dh
        let isToLeft = false
        let isToTop = false
        sw = SW // 虚拟像素宽度
        dw = this.RW
        sh = SH * this.progress
        dh = this.RH * this.progress
        sx = 0
        sy = 0
        dx = 0
        dy = 0
        isToTop = true
        this.ctx.drawImage(this.helper, sx, sy, sw, sh, dx, dy, dw, dh)
        if (isHorizontal) {
            const pw = SW - sw
            const psx = isToLeft ? SW - pw : 0
            const pdx = isToLeft ? dw : (dx - sx)
            const imageData = this.helperCtx.getImageData(psx, 0, pw + 1, this.RH)
            this.ctx.putImageData(imageData, pdx, 0)
        } else if (isVertical) {
            const ph = SH - sh
            const psy = isToTop ? SH - ph : 0
            const pdy = isToTop ? dh : (dy - sy)
            const imageData = this.helperCtx.getImageData(0, psy, this.RW, ph + 1)
            this.ctx.putImageData(imageData, 0, pdy)
        }
    }
    stackInBottom() {
        console.log(1);
        let w = this.helper.width;
        let h = this.helper.height;
        let SW = w
        let SH = h
        const isHorizontal = SW > this.RW
        const isVertical = SH > this.RH

        this.ctx.clearRect(0, 0, this.RW, this.RH)
        let sx, sy, sw, sh, dx, dy, dw, dh
        let isToLeft = false
        let isToTop = false
        sw = SW
        dw = this.RW
        sh = SH * this.progress
        dh = this.RH * this.progress
        sx = 0
        sy = SH - sh
        dx = 0
        dy = this.RH - dh
        this.ctx.drawImage(this.helper, sx, sy, sw, sh, dx, dy, dw, dh)
        if (isHorizontal) {
            const pw = SW - sw
            const psx = isToLeft ? SW - pw : 0
            const pdx = isToLeft ? dw : (dx - sx)
            const imageData = this.helperCtx.getImageData(psx, 0, pw + 1, this.RH)
            this.ctx.putImageData(imageData, pdx, 0)
        } else if (isVertical) {
            const ph = SH - sh
            const psy = isToTop ? SH - ph : 0
            const pdy = isToTop ? dh : (dy - sy)
            const imageData = this.helperCtx.getImageData(0, psy, this.RW, ph + 1)
            this.ctx.putImageData(imageData, 0, pdy)
        }
    }
    stackInLeft() {
        let w = this.helper.width;
        let h = this.helper.height;

        let SW = w // helper虚拟像素宽度
        let SH = h // helper虚拟像素高度
        const isHorizontal = SW > this.RW
        const isVertical = SH > this.RH

        this.ctx.clearRect(0, 0, this.RW, this.RH)
        let sx, sy, sw, sh, dx, dy, dw, dh
        let isToLeft = false
        let isToTop = false

        sw = SW * this.progress
        dw = this.RW * this.progress
        sh = SH
        dh = this.RH
        sx = 0
        sy = 0
        dx = 0
        dy = 0
        isToLeft = true
        this.ctx.drawImage(this.helper, sx, sy, sw, sh, dx, dy, dw, dh)
        if (isHorizontal) {
            const pw = SW - sw
            const psx = isToLeft ? SW - pw : 0
            const pdx = isToLeft ? dw : (dx - sx)
            const imageData = this.helperCtx.getImageData(psx, 0, pw + 1, this.RH)
            this.ctx.putImageData(imageData, pdx, 0)
        } else if (isVertical) {
            const ph = SH - sh
            const psy = isToTop ? SH - ph : 0
            const pdy = isToTop ? dh : (dy - sy)
            const imageData = this.helperCtx.getImageData(0, psy, this.RW, ph + 1)
            this.ctx.putImageData(imageData, 0, pdy)
        }
    }
    stackInRight() {
        let w = this.helper.width;
        let h = this.helper.height;

        let SW = w // helper虚拟像素宽度
        let SH = h // helper虚拟像素高度
        const isHorizontal = SW > this.RW
        const isVertical = SH > this.RH

        this.ctx.clearRect(0, 0, this.RW, this.RH)
        let sx, sy, sw, sh, dx, dy, dw, dh
        let isToLeft = false
        let isToTop = false

        sw = SW * this.progress
        dw = this.RW * this.progress
        sh = SH
        dh = this.RH
        sx = SW - sw
        sy = 0
        dx = this.RW - dw
        dy = 0
        this.ctx.drawImage(this.helper, sx, sy, sw, sh, dx, dy, dw, dh)
        if (isHorizontal) {
            const pw = SW - sw
            const psx = isToLeft ? SW - pw : 0
            const pdx = isToLeft ? dw : (dx - sx)
            const imageData = this.helperCtx.getImageData(psx, 0, pw + 1, this.RH)
            this.ctx.putImageData(imageData, pdx, 0)
        } else if (isVertical) {
            const ph = SH - sh
            const psy = isToTop ? SH - ph : 0
            const pdy = isToTop ? dh : (dy - sy)
            const imageData = this.helperCtx.getImageData(0, psy, this.RW, ph + 1)
            this.ctx.putImageData(imageData, 0, pdy)
        }
    }
    topLaser() {
        let w = this.helper.width;
        let h = this.helper.height;

        let SW = w
        let SH = h
        const isHorizontal = SW > this.RW
        const isVertical = SH > this.RH

        this.ctx.clearRect(0, 0, this.RW, this.RH)
        let sx, sy, sw, sh, dx, dy, dw, dh
        let isToLeft = false
        let isToTop = false

        sw = SW
        dw = this.RW
        sh = SH * this.progress
        dh = this.RH * this.progress
        sx = 0
        sy = SH - sh
        dx = 0
        dy = this.RH - dh
        this.ctx.drawImage(this.helper, sx, sy, sw, sh, dx, dy, dw, dh)
        if (isHorizontal) {
            const pw = SW - sw
            const psx = isToLeft ? SW - pw : 0
            const pdx = isToLeft ? dw : (dx - sx)
            const imageData = this.helperCtx.getImageData(psx, 0, pw + 1, this.RH)
            this.ctx.putImageData(imageData, pdx, 0)
        } else if (isVertical) {
            const ph = SH - sh
            const psy = isToTop ? SH - ph : 0
            const pdy = isToTop ? dh : (dy - sy)
            const imageData = this.helperCtx.getImageData(0, psy, this.RW, ph + 1)
            this.ctx.putImageData(imageData, 0, pdy)
        }
    }
    bottomLaser() {
        let w = this.helper.width;
        let h = this.helper.height;

        let SW = w
        let SH = h
        const isHorizontal = SW > this.RW
        const isVertical = SH > this.RH

        this.ctx.clearRect(0, 0, this.RW, this.RH)
        let sx, sy, sw, sh, dx, dy, dw, dh
        let isToLeft = false
        let isToTop = false
        sw = SW
        dw = this.RW
        sh = SH * this.progress
        dh = this.RH * this.progress
        sx = 0
        sy = 0
        dx = 0
        dy = 0
        isToTop = true
        this.ctx.drawImage(this.helper, sx, sy, sw, sh, dx, dy, dw, dh)
        if (isHorizontal) {
            const pw = SW - sw
            const psx = isToLeft ? SW - pw : 0
            const pdx = isToLeft ? dw : (dx - sx)
            const imageData = this.helperCtx.getImageData(psx, 0, pw + 1, this.RH)
            this.ctx.putImageData(imageData, pdx, 0)
        } else if (isVertical) {
            const ph = SH - sh
            const psy = isToTop ? SH - ph : 0
            const pdy = isToTop ? dh : (dy - sy)
            const imageData = this.helperCtx.getImageData(0, psy, this.RW, ph + 1)
            this.ctx.putImageData(imageData, 0, pdy)
        }
    }
    leftLaser() {
        let w = this.helper.width;
        let h = this.helper.height;

        let SW = w // helper虚拟像素宽度
        let SH = h // helper虚拟像素高度
        const isHorizontal = SW > this.RW
        const isVertical = SH > this.RH

        this.ctx.clearRect(0, 0, this.RW, this.RH)
        let sx, sy, sw, sh, dx, dy, dw, dh
        let isToLeft = false
        let isToTop = false

        sw = SW * this.progress
        dw = this.RW * this.progress
        sh = SH
        dh = this.RH
        sx = SW - sw
        sy = 0
        dx = this.RW - dw
        dy = 0
        this.ctx.drawImage(this.helper, sx, sy, sw, sh, dx, dy, dw, dh)
        if (isHorizontal) {
            const pw = SW - sw
            const psx = isToLeft ? SW - pw : 0
            const pdx = isToLeft ? dw : (dx - sx)
            const imageData = this.helperCtx.getImageData(psx, 0, pw + 1, this.RH)
            this.ctx.putImageData(imageData, pdx, 0)
        } else if (isVertical) {
            const ph = SH - sh
            const psy = isToTop ? SH - ph : 0
            const pdy = isToTop ? dh : (dy - sy)
            const imageData = this.helperCtx.getImageData(0, psy, this.RW, ph + 1)
            this.ctx.putImageData(imageData, 0, pdy)
        }
    }
    rightLaser() {
        let w = this.helper.width;
        let h = this.helper.height;

        let SW = w
        let SH = h
        const isHorizontal = SW > this.RW
        const isVertical = SH > this.RH

        this.ctx.clearRect(0, 0, this.RW, this.RH)
        let sx, sy, sw, sh, dx, dy, dw, dh
        let isToLeft = false
        let isToTop = false

        sw = SW * this.progress
        dw = this.RW * this.progress
        sh = SH
        dh = this.RH
        sx = 0
        sy = 0
        dx = 0
        dy = 0
        isToLeft = true
        this.ctx.drawImage(this.helper, sx, sy, sw, sh, dx, dy, dw, dh)
        if (isHorizontal) {
            const pw = SW - sw
            const psx = isToLeft ? SW - pw : 0
            const pdx = isToLeft ? dw : (dx - sx)
            const imageData = this.helperCtx.getImageData(psx, 0, pw + 1, this.RH)
            this.ctx.putImageData(imageData, pdx, 0)
        } else if (isVertical) {
            const ph = SH - sh
            const psy = isToTop ? SH - ph : 0
            const pdy = isToTop ? dh : (dy - sy)
            const imageData = this.helperCtx.getImageData(0, psy, this.RW, ph + 1)
            this.ctx.putImageData(imageData, 0, pdy)
        }
    }
    shutter() {
        const { effectType } = this.options
        const isX = effectType == 'h_shutter' ? true : false;
        const perSize = Math.ceil((isX ? this.RH : this.RW) / this.SHUTTER_COUNT)
        this.ctx.clearRect(0, 0, this.RW, this.RH)
        for (let i = 0; i < this.SHUTTER_COUNT; i++) {
            const pos = i * perSize
            const val = this.progress * perSize
            const x = isX ? 0 : pos
            const y = isX ? pos : 0
            const w = isX ? this.RW : val
            const h = isX ? val : this.RH
            if (val >= 1) {
                const imageData = this.helperCtx.getImageData(x, y, w, h)
                this.ctx.putImageData(imageData, x, y)
            }
        }
    }
}