import { useEffect, useRef, useState } from 'react';
import './App.css';

function Challenge() {
    const canvasRef = useRef(null);
    const toolbarRef = useRef(null);
    const isPaintingRef = useRef(false);
    const lineWidthRef = useRef(5);
    const [showWidthMenu, setShowWidthMenu] = useState(false);
    const [selectedWidth, setSelectedWidth] = useState(5);

    const strokeWidths = [
        { label: 'Thin', value: 2},
        { label: 'Medium', value: 5 },
        { label: 'Thick', value: 10 },
        { label: 'Extra Thick', value: 20 },
    ]
    
    const handleSave = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const image = canvas.toDataURL("image/");
        const link = document.createElement("a");
        link.href = image;
        link.download = "my-drawing.png";
        link.click();
    };


    useEffect(() => {
        const canvas = canvasRef.current;
        const toolbar = toolbarRef.current;
        
        if (!canvas || !toolbar) return;
        
        const ctx = canvas.getContext('2d');

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        toolbar.addEventListener('click', e => {
            if (e.target.id === 'clear') {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        });

        toolbar.addEventListener('change', e => {
            if(e.target.id === 'stroke') {
                ctx.strokeStyle = e.target.value;
            }
        });

        const draw = (e) => {
            if(!isPaintingRef.current) return;
            const rect = canvas.getBoundingClientRect();
            ctx.lineWidth = lineWidthRef.current;
            ctx.lineCap = 'round';
            ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
            ctx.stroke();
        }

        canvas.addEventListener('mousedown', (e) => {
            isPaintingRef.current = true;
        });

        canvas.addEventListener('mouseup', e => {
            isPaintingRef.current = false;
            ctx.stroke();
            ctx.beginPath();
        });

        canvas.addEventListener('mousemove', draw);

        return () => {
            canvas.removeEventListener('mousedown', () => {});
            canvas.removeEventListener('mouseup', () => {});
            canvas.removeEventListener('mousemove', draw);
            toolbar.removeEventListener('click', () => {});
            toolbar.removeEventListener('change', () => {});
        };
    }, []);

    const handleWidthSelect = (value) => {
        lineWidthRef.current = value;
        setSelectedWidth(value);
        setShowWidthMenu(false);
    }

    return (
            <div className="background">
                <section className="drawing-section">
                  <div ref={toolbarRef}>
                    <button onClick={handleSave}>
                        Save as Image
                    </button>
                    <label htmlFor="title">Colour</label>
                    <input id="stroke" name="stroke" type="color"/>
                    <div className="stroke-width-section">
                        <label htmlFor="title">Stroke</label>
                        <button id="lineWidth" name='lineWidth'></button>
                    </div>
                    <button id="clear">Clear Image</button>
                  </div>
                  <div className="drawing-board">
                    <canvas ref={canvasRef} id="drawing-board"></canvas>
                  </div>
            </section>
            </div>
    )
}

export default Challenge;

