function addConnections(elem, index) {
    var nodesConected = network.getConnectedNodes(index);
    var edgesWithOptions = new Array();
    nodesConected.forEach(function(idTo){
    	var idEdge = existEdge(parseInt(index), parseInt(idTo));
    	edgesWithOptions.push(edges.get(idEdge));
    });
    elem.connections = edgesWithOptions;
}

function addConnectionsSuper(elem, index) {
    var nodesConected = network_super.getConnectedNodes(index);
    var edgesWithOptions = new Array();
    nodesConected.forEach(function(idTo){
    	var idEdge = existEdgeSuper(parseInt(index), parseInt(idTo));
    	edgesWithOptions.push(edges.get(idEdge));
    });
    elem.connections = edgesWithOptions;
}

function objectToArray(obj) {
    return Object.keys(obj).map(function (key) {
      obj[key].id = key;
      obj[key].fullOptions = nodes.get(parseInt(key));
      obj[key].fullOptions.x = obj[key].x;
      obj[key].fullOptions.y = obj[key].y;
      return obj[key];
    });
}

function objectToArraySuper(obj) {
    return Object.keys(obj).map(function (key) {
      obj[key].id = key;
      obj[key].fullOptions = nodes_super.get(parseInt(key));
      obj[key].fullOptions.x = obj[key].x;
      obj[key].fullOptions.y = obj[key].y;
      return obj[key];
    });
}

function exportNetwork(type) {
    var nodes = objectToArray(network.getPositions());
    var nodes_super = objectToArraySuper(network_super.getPositions());
    nodes.forEach(addConnections);
    nodes_super.forEach(addConnectionsSuper);
    var all_nodes = {
    		nodesAll: nodes,
    		nodesSuperAll: nodes_super
    };
    // pretty print node data
    var exportValue = JSON.stringify(all_nodes, undefined, 2);
    
    if(type != "session"){
    	var blob = new Blob([exportValue], {type: "application/json"});
		saveAs(blob, $('#idText').text()+""+(new Date().getMilliseconds())+".dbw");
    }else{
    	sessionStorage.setItem('codeSave', exportValue);
    }
}

// load scheme

function importNetwork(type, value=null) {
	if(type != "session"){
	    var inputValue = value;
	}else{
	    var inputValue = sessionStorage.getItem('codeSave');
	}
    var inputData = JSON.parse(inputValue);
    getNodeData(inputData.nodesAll);
    getEdgeData(inputData.nodesAll);
    getNodeDataSuper(inputData.nodesSuperAll);
    getEdgeDataSuper(inputData.nodesSuperAll);
    updateTableElements();
}

function getNodeData(data) {
    data.forEach(function(elem, index, array) {
    	nodes.add(elem.fullOptions);
    });
}

function getNodeDataSuper(data) {
    data.forEach(function(elem, index, array) {
    	nodes_super.add(elem.fullOptions);
    });
}

function getEdgeData(data) {
    data.forEach(function(node) {
        // add the connection
        node.connections.forEach(function(connId, cIndex, conns) {
        	var idEdge = existEdge(connId.from, connId.to);
        	
        	if(idEdge == null){
        		edges.add(connId);
        	}
        	
            let cNode = getNodeById(data, connId.to);
            var elementConnections = cNode.connections;

            // remove the connection from the other node to prevent duplicate connections
            var duplicateIndex = elementConnections.findIndex(function(connection) {
              return connection == connId.from; // double equals since id can be numeric or string
            });

            if (duplicateIndex != -1) {
              elementConnections.splice(duplicateIndex, 1);
            };
      });
    });
}

function getEdgeDataSuper(data) {
    data.forEach(function(node) {
        // add the connection
        node.connections.forEach(function(connId, cIndex, conns) {
        	var idEdge = existEdgeSuper(connId.from, connId.to);
        	
        	if(idEdge == null){
        		edges_super.add(connId);
        	}
        	
            let cNode = getNodeById(data, connId.to);
            var elementConnections = cNode.connections;

            // remove the connection from the other node to prevent duplicate connections
            var duplicateIndex = elementConnections.findIndex(function(connection) {
              return connection == connId.from; // double equals since id can be numeric or string
            });

            if (duplicateIndex != -1) {
              elementConnections.splice(duplicateIndex, 1);
            };
      });
    });
}

function getNodeById(data, id) {
    for (var n = 0; n < data.length; n++) {
        if (data[n].id == id) {  // double equals since id can be numeric or string
          return data[n];
        }
    };

    throw 'Can not find id \'' + id + '\' in data';
}

function uploadData(fd){
	$.ajax({
        type: 'POST',
        url: '/readFile',
        data: fd,
        processData: false,
        contentType: false,
        success: function (data) {
        	var result = JSON.parse(data);
        	if(result[0]){
        		$("#textoFileDrag").text(result[0]);
        	}else{
        		importNetwork("file", result[1]);
        		$("#textoFileDrag").text(result[1]);
            	$("[aria-label='Close']").click();
        	}        	
        },
        error: function (xhr, ajaxOptions, thrownError) {
        	$("#textoFileDrag").text($("#textFileInvalid").text());
        }
    });
}

$(document).ready(function () {

	// Obtiene la información almacenada desde sessionStorage
	var data1 = sessionStorage.getItem('codeSave');
	
	if(data1){
		importNetwork("session");
	}
	
	$(".changeOptions").click(function() {
		exportNetwork("session");
	});
	
	$("#saveAs").click(function() {
		exportNetwork("file");
	});
	
	$("#loadFile").click(function() {
		$( "[functioninsert='loadFile']").click();
        $("#formModalButton").hide();
        
        $("html").on("dragover", function(e) {
            e.preventDefault();
            e.stopPropagation();
            $("#textoFileDrag").text($("#textDragHere").text());
        });

        $("html").on("drop", function(e) { e.preventDefault(); e.stopPropagation(); });

        // Drag enter
        $('.upload-area').on('dragenter', function (e) {
            e.stopPropagation();
            e.preventDefault();
        });

        // Drag over
        $('.upload-area').on('dragover', function (e) {
            e.stopPropagation();
            e.preventDefault();
        });

        // Drop
        $('.upload-area').on('drop', function (e) {
            e.stopPropagation();
            e.preventDefault();

            var file = e.originalEvent.dataTransfer.files;
            var fd = new FormData();
            fd.append('file', file[0]);
            uploadData(fd);
        });

        // Open file selector on div click
        $("#uploadfile").click(function(){
            $("#file").click();
        });

        // file selected
        $("#file").change(function(){
            var fd = new FormData();
            var files = $('#file')[0].files[0];
            fd.append('file',files);
            uploadData(fd);
        });
        
	});
	
	 // preventing page from redirecting
});