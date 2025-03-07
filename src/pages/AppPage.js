import React, {useEffect, useRef, useState} from 'react';
import Icons from "../assets/icons"
import { Group, Stage, Layer, Text, Image, Line, Label, Tag } from 'react-konva';
import _ from "lodash";
import { jsPDF } from "jspdf";
import EditLabel from "../components/EditLabel";

function AppPage() {
    const stageRef = useRef(null);
    const dragID = useRef(null);

    const [symbols] = useState([
        {
            id: 1, type: "DB", icon: Icons.DB, abbr: "DB", desc: "Elektrik dağıtım panosu.",
            konva_obj: {
                icon_unselect: Icons.DB_unselect,
                icon_select: Icons.DB_select,
                iconTitle: "DB",
                width: 40, height: 25,
                x: 0, y: 0, labelWidth: 0},
            values: {
                L: {value: 0, unit: "m", editable: false},
                k: {value: 1, unit: "", editable: true},
                A: {value: 3478, unit: "", editable: false},
                V: {value: 2000, unit: "V", editable: false},
                "VD%": {value: 0.00, unit: "%E", editable: false},
                VD: {value: 0.00, unit: "V", editable: false}},
            line: {
                type: {value: "BTS", text: "Type", unit: "", editable: false},
                length: {value: 0, text: "Length", unit: "m", editable: true},
                name: {value: "", text: "Hat adı", unit: "", editable: true}
            },
            connectables_id: [2, 3, 4, 5]
        },
        {
            id: 2, type: "MDB", icon: Icons.MDB, abbr: "MDB", desc: "Ana dağıtım panosu.",
            konva_obj: {
                icon_unselect: Icons.MDB_unselect,
                icon_select: Icons.MDB_select,
                iconTitle: "MDB",
                width: 80, height: 50,
                x: 0, y: 0, labelWidth: 0},
            values: {
                L: {value: 0, unit: "m", editable: false},
                A: {value: 3478, unit: "", editable: false},
                V: {value: 2000, unit: "V", editable: false},
                "VD%": {value: 0.00, unit: "%E", editable: false},
                VD: {value: 0.00, unit: "V", editable: false}},
            line: {
                type: {value: "BTS", text: "Type", unit: "", editable: false},
                length: {value: 0, text: "Length", unit: "m", editable: true},
                name: {value: "", text: "Hat adı", unit: "", editable: true}
            },
            connectables_id: [1, 3, 4, 5]
        },
        {
            id: 3, type: "Transformer", icon: Icons.TR, abbr: "TR", desc: "Voltajı değiştiren cihaz.",
            konva_obj: {
                icon_unselect: Icons.TR_unselect,
                icon_select: Icons.TR_select,
                iconTitle: "",
                width: 55, height: 80,
                x: 0, y: 0, labelWidth: 0},
            values: {
                Voltage: {value: 215, unit: "kW", editable: true},
                L: {value: 0, unit: "", hide: true, editable: false}},
            line: {
                type: {value: "BTS", text: "Type", unit: "", editable: false},
                length: {value: 0, text: "Length", unit: "m", editable: true},
                name: {value: "", text: "Hat adı", unit: "", editable: true}
            },
            connectables_id: [2, 5]
        },
        {
            id: 4, type: "G", icon: Icons.G, abbr: "G", desc: "Yeni enerji üreten cihaz.",
            konva_obj: {
                icon_unselect: Icons.G_unselect,
                icon_select: Icons.G_select,
                iconTitle: "",
                width: 50, height: 50,
                x: 0, y: 0, labelWidth: 0},
            values: {
                L: {value: 0, unit: "m", editable: false},
                k: {value: 1, unit: "", editable: true},
                A: {value: 3478, unit: "", editable: false},
                V: {value: 2000, unit: "V", editable: false},
                "VD%": {value: 0.00, unit: "%E", editable: false},
                VD: {value: 0.00, unit: "V", editable: false}},
            line: {
                type: {value: "BTS", text: "Type", unit: "", editable: false},
                length: {value: 0, text: "Length", unit: "m", editable: true},
                name: {value: "", text: "Hat adı", unit: "", editable: true}
            },
            connectables_id: [2, 5]
        },
        {
            id: 5, type: "ECL", icon: Icons.ECL, abbr: "ECL", desc: "Kapatma",
            konva_obj: {
                icon_unselect: Icons.ECL_unselect,
                icon_select: Icons.ECL_select,
                iconTitle: "",
                width: 70, height: 70,
                x: 0, y: 0, labelWidth: 0},
            values: {
                L: {value: 0, unit: "m", editable: false}},
            line: {
                type: {value: "BTS", text: "Type", unit: "", editable: false},
                length: {value: 0, text: "Length", unit: "m", editable: true},
                name: {value: "", text: "Hat adı", unit: "", editable: true}
            },
            connectables_id: []
        }
    ])
    const [lines] = useState([
        {id:1, type: "BTS", desc: "Busbar Trunking System"},
    ])
    const [const_values] = useState({
        "Cos Theta": 0.8,
        "Sin Theta": 0.6,
        "Diversite": 1,
        "Voltage": 415,
        "S": 2500});

    const [tree, setTree] = useState({})
    const [connectables, setConnectables] = useState([])
    const [selectedNode, setSelectedNode] = useState({});
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [selectedLineId, setSelectedLineId] = useState(1);
    const [isLineSelected, setIsLineSelected] = useState(false);
    const [nodeIDCounter, setNodeIDCounter] = useState(1);

    const [stageSize] = useState({
        width: window.innerWidth * (1 - 0.09 - 0.11),
        height: window.innerHeight - 91
    })
    const centerX = Math.floor(stageSize.width / 2);
    const centerY = Math.floor(stageSize.height / 2);
    const [startPosition] = useState({x: 750, y: 350})

    useEffect(() => {
        if (symbols && (!tree || Object.keys(tree).length === 0)) {
            addNodeToArea(3)
        }
    }, []);

    useEffect(() => {
        if(selectedNode && Object.keys(selectedNode).length > 0){
            const { connectables_id } = selectedNode
            setConnectables(connectables_id)
        }
    }, [selectedNode]);

    useEffect(() => {
        if (!selectedNodeId) return;

        const node = findNodeDeep(tree, selectedNodeId);

        if (node) setSelectedNode(node);
    }, [tree, selectedNodeId]);

    /**
     * addNodeToArea - Yeni bir düğümü belirli bir konuma ekler.
     * @param {number} id - Yeni Node Türü ID bilgisi (Symbols.ID).
     * @param {Object} [position=startPosition] - Eklenecek Node konumu.
     */
    const addNodeToArea = (id, position = startPosition) => {
        let newNode = structuredClone(symbols.find(symbol => symbol.id === parseInt(id)));
        let isDrag = JSON.stringify(position) !== JSON.stringify(startPosition);

        const prepareToAdd = async (newNode) => {
            let active_x = position.x
            let active_y = position.y
            if(selectedNode && Object.keys(selectedNode).length > 0){
                active_x = selectedNode["konva_obj"]["x"];
                active_y = selectedNode["konva_obj"]["y"] - newNode.konva_obj.height - 75;
                newNode.values.L.value = selectedNode.values.L.value;
            }
            newNode.id = nodeIDCounter
            newNode.parentID = nodeIDCounter === 1 ? 0 : selectedNode.id
            newNode.key = nodeIDCounter
            setNodeIDCounter(nodeIDCounter + 1)
            newNode.konva_obj.x = isDrag ? position.x : active_x
            newNode.konva_obj.y = isDrag ? position.y : active_y
            newNode.konva_obj.labelWidth = getLabelWith(newNode.values)
            newNode.children = []

            if (newNode.konva_obj.icon_select && typeof newNode.konva_obj.icon_select === "string") {
                const img_s = new window.Image();
                const img_us = new window.Image();
                img_s.src = newNode.konva_obj.icon_select;
                img_us.src = newNode.konva_obj.icon_unselect;
                img_s.onload = () => {
                    newNode.konva_obj.icon_select = img_s
                    newNode.konva_obj.icon_unselect = img_us

                    setTree((prevTree) => {
                        const copiedTree = _.cloneDeep(prevTree)
                        return addToTree(copiedTree);
                    });
                    setSelectedNodeId(newNode.id)
                };
            }
        };

        const addToTree = (node) => {
            if (!node || Object.keys(node).length === 0) {
                return newNode;
            }

            if (node.id === selectedNode.id) {
                node.children.push(newNode);
            } else {
                node.children.forEach(addToTree);
            }

            return node;
        };

        prepareToAdd(newNode).then(r => {});
    }

    /**
     findNodeDeep - Ağaç yapısında belirtilen ID'ye sahip düğümü bulur.
     Lodash kullanıldığında sonuç hatalı olduğu için bu fonksiyon yazıldı.
     @param {Object} node - Ağaç düğümü.
     @param {number} nodeId - Aranacak düğüm ID.
     @returns {Object|null} - Bulunan düğüm veya null.
     */
    const findNodeDeep = (node, nodeId) => {
        if (node.id === nodeId) {
            return node;
        }

        for (const child of node.children) {
            const result = findNodeDeep(child, nodeId);
            if (result) {
                return result;
            }
        }

        return null;
    };

    /**
     * updateNodePosition - Belirtilen düğümün konumunu günceller.
     * @param {Object} position - Yeni x, y koordinatları.
     * @param {number} id - Güncellenecek düğümün ID.
     */
    const updateNodePosition = (position, id) => {
        const updatePosition = (node) => {
            if (node.id === id) {
                node.konva_obj.x = parseInt(position.x);
                node.konva_obj.y = parseInt(position.y);
            } else {
                node.children.forEach(updatePosition);
            }

            return node;
        };

        setTree(prevTree => {
            const copiedTree = _.cloneDeep(prevTree)
            return updatePosition(copiedTree);
        });
    };

    /**
     * updateNodeValue - Belirtilen düğümün değerini günceller.
     * @param {Event} event - Event.
     * @param {number} [id=selectedNodeId] - Güncellenecek düğüm ID.
     * @param {string} [key="values"] - Güncellenecek değer kategorisi.
     */
    const updateNodeValue = (event, id = selectedNodeId, key = "values") => {
        const { name, value } = event.target;
        console.log(name, value);
        let valueWidth;

        const updateValue = (node) => {
            if (node.id === id) {
                node[key][name].value = value;
            } else {
                node.children.forEach(updateValue);
            }

            valueWidth = getLabelWith(node.values)
            node.konva_obj.labelWidth = valueWidth;
            if (key === "line" && name === "length") {
                updateLForNodeAndChildren(id)
            }
            return node;
        };

        setTree(prevTree => {
            const copiedTree = _.cloneDeep(prevTree)
            return updateValue(copiedTree);
        });
    }

    /**
     * updateLForNodeAndChildren - Belirtilen düğüm ve alt düğümler için L değerini günceller.
     * Diğer değerler de (VD gibi) gerekli matematiksel hesaplamalara göre eklenebilir.
     * @param {number} targetId - Güncellenecek düğüm kimliği.
     */
    const updateLForNodeAndChildren = (targetId) => {

        const updateLValue = (node, parent = null) => {
            if (!node) return;

            const parentL = parent ? (parent.parentID === 0) ? 0 :
                parseInt(parent.values.L.value) : null;

            node.values.L.value = (parseInt(node.line.length.value) || 0) + (parentL ?? 0);

            if (Array.isArray(node.children)) {
                node.children.forEach(child => updateLValue(child, node));
            }
        };

        const findAndUpdate = (node, parent = null) => {
            if (!node) return false;
            if (node.id === targetId) {
                updateLValue(node, parent);
                return true;
            }
            return Array.isArray(node.children) && node.children.some(child => findAndUpdate(child, node));
        };

        setTree(prevTree => {
            const copiedTree = _.cloneDeep(prevTree)
            findAndUpdate(copiedTree);
            return copiedTree;
        });
    };

    const getLabelWith = (textList) => {
        let textWidth = 0
        if (textList) {
            Object.entries(textList)
                .map(([key, obj]) => {
                    let text = `${key}: ${obj.value} ${obj.unit}`
                    if (text.length > textWidth) {
                        textWidth = text.length
                    }
                })
        }
        return textWidth * 6 + 15;
    }

    /**
     * handleWheel - Sahneyi yakınlaştırır veya uzaklaştırır. Mouse konumuna göre merkezleyerek çalışır.
     * @param {Object} e - Wheel (Mouse tekerlek) event nesnesi.
     */
    const handleWheel = (e) => {
        const stage = e.target.getStage();
        const pointer = stage.getPointerPosition();
        const scaleBy = 1.05;

        const oldScale = stage.scaleX();
        const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

        if (newScale < 0.3 || newScale > 4) return;

        const newPos = {
            x: pointer.x - ((pointer.x - stage.x()) * newScale) / oldScale,
            y: pointer.y - ((pointer.y - stage.y()) * newScale) / oldScale,
        };

        stage.scale({ x: newScale, y: newScale });
        stage.position(newPos);
        stage.batchDraw();
    };

    /**
     * homeView - Çalışma alanındaki zoom ve taşımayı sıfırlayarak başlangıçtaki görünüme geri döner.
     *
     */
    const homeView = () => {
        const stage = stageRef.current;
        stage.scale({x: 1, y: 1});
        stage.position({x: 0, y: 0});
        stage.batchDraw();
    }

    /**
     * handleExportPng - Konva sahnesini seçili düğümü sıfırladıktan sonra PNG formatında oluşturur ve indirir.
     *
     */
    const handleExportPng = () => {
        setSelectedNode({})
        setTimeout(() => {
            const uri = stageRef.current.toDataURL();
            const link = document.createElement('a');
            link.download = 'stage.png';
            link.href = uri;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },10)
    }

    /**
     * handleExportPdf - Konva sahnesini seçili düğümü sıfırladıktan sonra PDF formatında oluşturur ve indirir.
     *
     */
    const handleExportPdf = () => {
        setSelectedNode({})
        setTimeout(() => {
            const uri = stageRef.current.toDataURL();
            const pdf = new jsPDF({
                orientation: "l",
                unit: "mm",
                format: "a4",
            });
            pdf.addImage(uri, 'PNG', 10, 10,
                (window.innerWidth * (1 - 0.09 - 0.11)) / 4.5,
                (window.innerHeight - 90) / 4.5);
            pdf.save('stage.pdf');
        },10)
    }

    /**
     * renderTreeGroup - Bir düğüm ve çocukları için Konva grup öğesi oluşturur.
     * Düğümün görsel özelliklerini, metin etiketlerini ve iconlarını render eder.
     * Düğümün sürüklenmesiyle konumu güncellenir ve seçili düğüm işaretlenir.
     * Çocuk düğümler varsa, fonksiyon kendini rekürsif olarak çağırarak alt düğümleri de render eder.
     *
     * @param {Object} node - Render edilecek ağaç verisi.
     */
    const renderTreeGroup = (node) => (
        <>
            <Group
                x={node.konva_obj.x}
                y={node.konva_obj.y}
                blue={120}
                green={120}
                red={120}

                // offsetX={node.konva_obj.width / 2}
                // offsetY={node.konva_obj.height / 2}
                onClick={() => {
                    setSelectedNodeId(node.id)
                    setIsLineSelected(false)
                }}

                draggable
                onDragStart={(e) => {
                    setSelectedNodeId(node.id)
                    setIsLineSelected(false)
                }}
                onDragMove={(e) => {
                    updateNodePosition({x: e.target.x(), y: e.target.y()}, node.id)
                }}
                onDragEnd={(e) => {
                    console.log("drag end:", e.target.x(), e.target.y())
                }}
            >

                <Label
                    x={node.konva_obj.x < centerX ? -15 : (node.konva_obj.width + 15)}
                    offsetX={node.konva_obj.x < centerX ? node.konva_obj.labelWidth + 15 : 0}
                    visible={true}
                    stroke={'#333'}
                >
                    <Tag
                        stroke={'black'}
                        strokeWidth={1.7}
                    />
                    <Text
                        text={Object.entries(node.values)
                            .map(([key, obj]) => {
                                if (!obj.hide)
                                    return `${key}: ${obj.value} ${obj.unit}`
                            })
                            .join('\n')}
                        fontSize={13}
                        lineHeight={1.5}
                        fill="black"
                        x={0}
                        y={0}
                        padding={10}
                    />
                </Label>

                <Text
                    text={node.konva_obj.iconTitle}
                    y={-17}
                    fontSize={14}
                    width={node.konva_obj.width}
                    fontStyle="bold"
                    align={"center"}
                />
                <Image
                    image={(!isLineSelected && selectedNode.id === node.id) ?
                        node.konva_obj.icon_select :
                        node.konva_obj.icon_unselect}
                    width={node.konva_obj.width}
                    height={node.konva_obj.height}
                />
            </Group>
            {node.children.map(renderTreeGroup)}
        </>
    );

    /**
     * renderTreeLine - Bir düğüm ile çocukları arasındaki bağlantıları (Line öğeleri) ve
     * her bir bağlantıya ait metin etiketlerini render eder.
     * Her bir bağlantı çizgisi üzerine tıklanabilir.
     * Ayrıca, bağlantı uzunluğu varsa, bu uzunluk değeri de etiket olarak gösterilir.
     * Fonksiyon, çocuk düğümleri için rekürsif olarak kendini çağırır ve her bir bağlantıyı ilgili düğümle ilişkilendirir.
     *
     * @param {Object} node - Render edilecek ağaç verisi.
     */
    const renderTreeLine = (node) => (
        <>
            {
                node.children.length > 0 && node.children.map((child, key) => {
                    const lineText = child.line.name.value !== "" ?
                                    child.line.name.value : child.line.type.value;
                    return <Group

                    >
                        <Line
                            points={[node.konva_obj.x + node.konva_obj.width / 2,
                                node.konva_obj.y + node.konva_obj.height / 2,
                                child.konva_obj.x + child.konva_obj.width / 2,
                                node.konva_obj.y + node.konva_obj.height / 2]}
                            stroke={(isLineSelected && selectedNode.id === child.id) ? "#0000ff" : "#ed7d31"}
                            lineCap={'round'}
                            lineJoin={'round'}
                            strokeWidth={5}
                            onClick={() => {
                                setIsLineSelected(true)
                                setSelectedNodeId(child.id)
                            }}
                        />
                        <Text
                            text={`${lineText}`}
                            fontSize={13}
                            lineHeight={1.5}
                            fill="black"
                            x={((node.konva_obj.x + node.konva_obj.width / 2) +
                                (child.konva_obj.x + child.konva_obj.width / 2))/2}
                            y={( node.konva_obj.y + node.konva_obj.height / 2 ) + 7}
                            padding={10}
                        />
                        <Line
                            points={[child.konva_obj.x + child.konva_obj.width / 2,
                                node.konva_obj.y + node.konva_obj.height / 2,
                                child.konva_obj.x + child.konva_obj.width / 2,
                                child.konva_obj.y + child.konva_obj.height / 2,]}
                            stroke={(isLineSelected && selectedNode.id === child.id) ? "#0000ff" : "#ed7d31"}
                            lineCap={'round'}
                            lineJoin={'round'}
                            strokeWidth={5}
                            onClick={() => {
                                setIsLineSelected(true)
                                setSelectedNodeId(child.id)
                            }}
                        />
                        <Text
                            text={`${lineText}`}
                            fontSize={13}
                            lineHeight={1.5}
                            fill="black"
                            x={(child.konva_obj.x + child.konva_obj.width / 2) + 7}
                            y={((node.konva_obj.y + node.konva_obj.height / 2) +
                                (child.konva_obj.y + child.konva_obj.height / 2)) / 2}
                            padding={10}
                        />
                        {child.line.length.value > 0 && <Label
                            x={child.konva_obj.x + child.konva_obj.width / 2}
                            y={node.konva_obj.y + node.konva_obj.height / 2}
                            offsetX={25}
                            offsetY={15}
                            visible={true}
                        >
                            <Tag
                                fill={"#f28c28"}
                                stroke={'#b5651d'}
                                strokeWidth={1.7}
                                cornerRadius={5}
                            />
                            <Text
                                text={`L=${child.line.length.value}m`}
                                fontSize={13}
                                lineHeight={1.5}
                                fill="white"
                                x={0}
                                y={0}
                                padding={10}
                            />
                        </Label>}
                    </Group>
                })
            }
            {node.children.map(renderTreeLine)}
        </>
    );

    return (
        <div className={"app-page"}>
            <div className={"selection-area"}>
                <div className={"selection-section symbol-selection"}>
                    <label htmlFor="#" style={{fontSize: "16px"}}>Symbols</label>
                    <div className={"symbols"}>
                        {
                            symbols.map((symbol, index) => {
                                const isConnectable = connectables.includes(index+1)
                                return <img
                                    style={(!isConnectable || isLineSelected) ?
                                        {filter: "grayscale(100%)", cursor: "no-drop"} :
                                        {fiter: "none", cursor: "pointer"}}
                                    id={symbol.id}
                                    src={symbol.icon}
                                    alt={symbol.abbr}
                                    width={"100%"} key={index}
                                    onClick={() => isConnectable && !isLineSelected && addNodeToArea(symbol.id)}
                                    draggable={isConnectable && !isLineSelected && "true"}
                                    onDragStart={(e) => {
                                        console.log("drag e:", e)
                                        dragID.current = e.target.id;
                                    }}
                                />
                            })
                        }
                    </div>
                </div>
                <div className={"selection-section line-selection"}>
                    <label htmlFor="#" style={{fontSize: "16px"}}>Line Selection</label>
                    <div className={"lines"}>
                        {
                            lines.map((line, index) => {
                                return <button className={"line-button"}
                                               key={index}
                                               style={selectedLineId === line.id ?
                                                   {border: "3px solid #0000ff"} : {}}
                                               onClick={(e) => {
                                                   setSelectedLineId(line.id)
                                               }}
                                >
                                    <p className={"line-button-title"}>{line.type}</p>
                                    <p className={"line-button-desc"}>{line.desc}</p>
                                </button>
                            })
                        }
                    </div>
                </div>
            </div>
            <div className={"canvas-area"}
                 onDrop={(e) => {
                     e.preventDefault();
                     stageRef.current.setPointersPositions(e);
                     addNodeToArea(dragID.current, stageRef.current.getPointerPosition())
                 }}
                 onDragOver={(e) => e.preventDefault()}
            >
                <button className={"home-button"} onClick={homeView}>
                    <img src={Icons.Home} alt="Home"/>
                </button>
                <div className={"export-buttons"}>
                    <button className={"export-button"} onClick={handleExportPng}>
                        <img src={Icons.Png} alt="Png" height={40}/>
                    </button>
                    <button className={"export-button"} onClick={handleExportPdf}>
                        <img src={Icons.Pdf} alt="Pdf" height={40}/>
                    </button>
                </div>
                <Stage
                    ref={stageRef}
                    width={stageSize.width}
                    height={stageSize.height}
                    draggable
                    onWheel={handleWheel}
                >
                    <Layer>
                        <Line key="vertical"
                              points={[centerX, -1000, centerX, stageSize.height + 1000]}
                              stroke="#ccc"
                              strokeWidth={1}/>
                        <Line key="horizontal"
                              points={[-1000, centerY, stageSize.width + 1000, centerY]}
                              stroke="#ccc"
                              strokeWidth={1}/>

                        {tree && Object.keys(tree).length > 0 && renderTreeLine(tree)}

                        {tree && Object.keys(tree).length > 0 && renderTreeGroup(tree)}
                    </Layer>
                </Stage>
            </div>
            <div className={"info-area"}>
                <div className={"info-section shape-properties"}>
                    <p className={"info-title"}>Shape Properties</p>
                    {
                        selectedNode && Object.keys(selectedNode).length > 0 && (() => {
                            const {type, konva_obj, line} = selectedNode;
                            const {x, y, width, height} = konva_obj;
                            let keyWidth = 35;
                            return (isLineSelected ?
                                    Object.entries(line)
                                    .map(([key, obj]) => (
                                        <EditLabel
                                            name={key}
                                            text={obj.text}
                                            key={key}
                                            type={"text"}
                                            editable={obj.editable}
                                            defaultValue={obj.value}
                                            value={obj.value}
                                            keyWidth={50}
                                            onChange={(e) => {
                                                updateNodeValue(e, selectedNodeId, "line")
                                            }}
                                        />
                                    ))
                                 :
                                <>
                                    <EditLabel name={"ID"} defaultValue={selectedNode.id} keyWidth={keyWidth}/>
                                    <EditLabel name={"Type"} defaultValue={type} keyWidth={keyWidth}/>
                                    <EditLabel name={"X"} defaultValue={x} keyWidth={keyWidth}/>
                                    <EditLabel name={"Y"} defaultValue={y} keyWidth={keyWidth}/>
                                    <EditLabel name={"Width"} defaultValue={width} keyWidth={keyWidth}/>
                                    <EditLabel name={"Height"} defaultValue={height} keyWidth={keyWidth}/>
                                </>
                            );
                        })()
                    }
                </div>

                {!isLineSelected && <div className={"info-section values"}>
                    <p className={"info-title"}>Values</p>
                    {
                        selectedNode && Object.keys(selectedNode).length > 0 && (() => {
                            const {values} = selectedNode;

                            return Object.entries(values)
                                .map(([key, obj]) => (
                                    !obj.hide && <EditLabel
                                        name={key}
                                        key={key}
                                        editable={obj.editable}
                                        defaultValue={obj.value}
                                        value={obj.value}
                                        keyWidth={35}
                                        onChange={(e) => {
                                            updateNodeValue(e)
                                        }}
                                    />
                                ))
                        })()
                    }
                </div>}

                <div className={"info-section constants"}>
                    <p className={"info-title"}>Constants</p>
                    {
                        const_values && Object.entries(const_values)
                            .map(([key, value]) => (
                                    <EditLabel
                                        name={key}
                                        key={key}
                                        defaultValue={value}
                                        keyWidth={50}
                                    />
                            ))
                    }
                </div>
            </div>
        </div>
    )
}

export default AppPage;