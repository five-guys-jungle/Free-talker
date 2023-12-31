import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { setRecord } from "../../stores/recordSlice";
import { RootState } from "../../stores";

const Record: React.FC = () => {
    const mainSVGRef = useRef<SVGSVGElement>(null);
    const dispatch = useDispatch();
    const state = useSelector(
        (state: { record: { record: boolean } }) => state.record.record
    );
    const message = useSelector(
        (state: { record: { message: string } }) => state.record.message
    );
    const messageColor: string = useSelector(
        (state: RootState) => state.record.messageColor
    );
    const stateRef = useRef(state);

    const doClick = () => {
        const state = stateRef.current;
        const tl = gsap.timeline({
            defaults: {
                ease: "elastic(0.2, 0.48)",
                duration: 0.4,
            },
        });
        if (state) {
            tl.to("line", {
                scale: 1,
                strokeWidth: 7,
                y: -0,
            })
                .to(
                    "#mic",
                    {
                        scale: 1,
                        fill: "#44484D",
                    },
                    0
                )
                .to(
                    "#mic rect",
                    {
                        fill: "#44484D",
                        attr: { filter: "" },
                    },
                    0
                );
        } else {
            tl.to("line", {
                strokeWidth: 0,
                y: -0,
            })
                .to(
                    "#mic rect",
                    {
                        fill: "#ed002d",
                        attr: { filter: "url(#glow2)" },
                    },
                    0
                )
                .to(
                    "#mic",
                    {
                        scale: 1.3,
                        fill: "#555b60",
                    },
                    0
                );
        }
    };

    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    useEffect(() => {
        doClick();
    }, [state]);

    useEffect(() => {
        const mainSVG = mainSVGRef.current;
        if (!mainSVG) {
            return;
        }

        gsap.set("svg", {
            visibility: "visible",
        });
        gsap.set("#mic", {
            transformOrigin: "50% 100%",
        });
    }, [dispatch]);

    return (
        <RecDiv>
            <Container>
                <svg
                    ref={mainSVGRef}
                    id="mainSVG"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="340 200 100 170"
                    preserveAspectRatio="xMidYMid meet"
                >
                    <defs>
                        <filter
                            id="glow"
                            x="-100%"
                            y="-100%"
                            width="250%"
                            height="250%"
                        >
                            <feGaussianBlur
                                stdDeviation="15"
                                result="coloredBlur"
                            />
                            <feOffset
                                dx="0"
                                dy="0"
                                result="offsetblur"
                            ></feOffset>
                            <feFlood
                                id="glowAlpha"
                                floodColor="red"
                                floodOpacity="1"
                            ></feFlood>
                            <feComposite
                                in2="offsetblur"
                                operator="in"
                            ></feComposite>
                            <feMerge>
                                <feMergeNode />
                                <feMergeNode in="SourceGraphic"></feMergeNode>
                            </feMerge>
                        </filter>

                        <filter
                            id="glow2"
                            x="-100%"
                            y="-100%"
                            width="250%"
                            height="250%"
                        >
                            <feGaussianBlur
                                stdDeviation="5"
                                result="coloredBlur"
                            />
                            <feOffset
                                dx="0"
                                dy="0"
                                result="offsetblur"
                            ></feOffset>
                            <feFlood
                                id="glowAlpha"
                                floodColor="red"
                                floodOpacity="1"
                            ></feFlood>
                            <feComposite
                                in2="offsetblur"
                                operator="in"
                            ></feComposite>
                            <feMerge>
                                <feMergeNode />
                                <feMergeNode in="SourceGraphic"></feMergeNode>
                            </feMerge>
                        </filter>

                        <filter
                            id="Bevel"
                            filterUnits="objectBoundingBox"
                            x="-10%"
                            y="-10%"
                            width="150%"
                            height="150%"
                        >
                            <feGaussianBlur
                                in="SourceAlpha"
                                stdDeviation="2"
                                result="blur"
                            />
                            <feSpecularLighting
                                in="blur"
                                surfaceScale="5"
                                specularConstant="0.125"
                                specularExponent="10"
                                result="specOut"
                                lightingColor="white"
                            >
                                <fePointLight x="-5000" y="-10000" z="20000" />
                            </feSpecularLighting>
                            <feComposite
                                in="specOut"
                                in2="SourceAlpha"
                                operator="in"
                                result="specOut2"
                            />
                            <feComposite
                                in="SourceGraphic"
                                in2="specOut2"
                                operator="arithmetic"
                                k1="0"
                                k2="1"
                                k3="1"
                                k4="0"
                                result="litPaint"
                            />
                        </filter>

                        <filter
                            id="shadow"
                            x="-100%"
                            y="-100%"
                            width="250%"
                            height="250%"
                        >
                            <feGaussianBlur
                                stdDeviation="5"
                                result="coloredBlur"
                            />
                            <feOffset
                                dx="-2"
                                dy="6"
                                result="offsetblur"
                            ></feOffset>
                            <feFlood
                                id="glowAlpha"
                                floodColor="#181618"
                                floodOpacity="0.831"
                            ></feFlood>
                            <feComposite
                                in2="offsetblur"
                                operator="in"
                            ></feComposite>
                            <feMerge>
                                <feMergeNode />
                                <feMergeNode in="SourceGraphic"></feMergeNode>
                            </feMerge>
                        </filter>
                    </defs>
                    <g id="mic" fill="#44484D">
                        <rect
                            x="386.5"
                            y="250.4"
                            width="27"
                            height="59.69"
                            rx="13.5"
                        />
                        <path d="M432.74,295.67a4.5,4.5,0,0,0-9,0,23.74,23.74,0,0,1-47.48,0,4.5,4.5,0,0,0-9,0,32.79,32.79,0,0,0,28.24,32.42V340.6h-4.94a4.5,4.5,0,0,0,0,9h18.88a4.5,4.5,0,0,0,0-9H404.5V328.09A32.79,32.79,0,0,0,432.74,295.67Z" />
                    </g>

                    <g id="shad" filter="url(#shadow)">
                        <g id="mainLine" filter="url(#glow)">
                            <line
                                filter="url(#Bevel)"
                                x1="360.73"
                                y1="260.73"
                                x2="439.27"
                                y2="343.72"
                                fill="none"
                                stroke="#ed002d"
                                strokeLinecap="round"
                                strokeMiterlimit="10"
                                strokeWidth="7"
                            />
                        </g>
                    </g>
                </svg>
                <Instructions style={{ color: messageColor }}>
                    {message.split("\n").map((line, index) => (
                        <p key={index}>
                            {line}
                        </p>
                    ))}
                </Instructions>
            </Container>

        </RecDiv>
    );
};

export default Record;

const RecDiv = styled.div`
    body {
        background-color: #111;
        width: 100%;
        height: 50%;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    body,
    html {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
    }

    svg {
        display: flex;                  // Add flex display
        align-items: center;             // Center vertically
        justify-content: center;         // Center horizontally
        width: 100%;
        height: 100%;
        // margin-top:10px;
        // margin-right: -42vh;
        object-fit: contain;
        
    }
`;

const Container = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 25vh;
    // margin-top:5%;
    margin-left:9.5%;
    flex-direction: row;
    // gap: 5px;

    & > svg {
        flex: 4; 
        aspect-ratio: 4 / 6;
    }

    & > div {
        flex: 6; 
    }
`;

const Instructions = styled.div`
    // font-family: Verdana;
    font-family: 'MaplestoryOTFLight';
    font-size: 1.65em;
    font-weight: bold;
`;
