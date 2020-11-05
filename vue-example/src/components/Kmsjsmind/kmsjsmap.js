import $ from 'jquery'
let jQuery = $
var $conTextMenu = '';

// an noop function define
var _noop = function() {};

// 河蟹IE8 时 没有Object.keys方法
if (!Object.keys) {
  Object.keys = (function() {
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty,
      hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
      dontEnums = [
        'toString',
        'toLocaleString',
        'valueOf',
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        'constructor'
      ],
      dontEnumsLength = dontEnums.length;

    return function(obj) {
      if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      var result = [],
        prop, i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());
}

(function($) {
  var html = `<div id="kmsjsmap_contextmenu">
    <ul class="kmsjsmap-dropdown-menu">
    <li><a href="javascript: kmsjsmap.create_node();">添加节点</a></li>
    <li><a href="javascript: kmsjsmap.modify_node()">编辑节点</a></li>
    <li><a href="javascript: kmsjsmap.del_node()">删除节点</a></li>
    <li><a href="javascript: kmsjsmap.relation_node()">关联节点</a></li>
    <li><a href="javascript: kmsjsmap.delete_relation_node()">取消关联</a></li>
    </ul>
  </div>`;
  $('.ksmenu').append(html);
  // koringz  切记 在public/index.html 添加这个代码标签 <div class="ksmenu"></div> 
  $conTextMenu = $('div#kmsjsmap_contextmenu');
})(jQuery);


/*
 * Released under BSD License
 * Copyright (c) 2014-2015 hizzgdev@163.com
 *
 * Project Home:
 *   https://github.com/hizzgdev/jsmind/
 */
(function($w) {
  'use strict';
  // set 'jsMind' as the library name.
  // __name__ should be a const value, Never try to change it easily.
  var __name__ = 'jsMind';
  // library version
  var __version__ = '0.4.6';

  var logger = (typeof console === 'undefined') ? {
    log: _noop,
    debug: _noop,
    error: _noop,
    warn: _noop,
    info: _noop
  } : console;

  if (!logger.debug) logger.debug = _noop;

  // check global variables
  if (typeof module === 'undefined' || !module.exports) {
    if (typeof $w[__name__] != 'undefined') {
      logger.log(__name__ + ' has been already exist.');
      return;
    }
  }

  // shortcut of methods in dom
  var $d = $w.document;
  var $g = function(id) { return $d.getElementById(id); };
  var $c = function(tag) { return $d.createElement(tag); };
  var $t = function(n, t) { if (n.hasChildNodes()) { n.firstChild.nodeValue = t; } else { n.appendChild($d.createTextNode(t)); } };
  var $h = function(n, t) { n.innerHTML = t; };
  // detect isElement
  var $i = function(el) { return !!el && (typeof el === 'object') && (el.nodeType === 1) && (typeof el.style === 'object') && (typeof el.ownerDocument === 'object'); };
  if (typeof String.prototype.startsWith != 'function') { String.prototype.startsWith = function(p) { return this.slice(0, p.length) === p; }; }

  var DEFAULT_OPTIONS = {
    container: '', // id of the container
    editable: false, // you can change it in your options
    theme: null,
    mode: 'full', // full or side
    support_html: true,

    view: {
      hmargin: 100,
      vmargin: 50,
      line_width: 2,
      line_color: '#555'
    },
    layout: {
      hspace: 30,
      vspace: 20,
      pspace: 13
    },
    default_event_handle: {
      enable_mousedown_handle: true,
      enable_click_handle: true,
      enable_dblclick_handle: true
    },
    shortcut: {
      enable: true,
      handles: {},
      mapping: {
        addchild: 45, // Insert
        addbrother: 13, // Enter
        editnode: 113, // F2
        delnode: 46, // Delete
        toggle: 32, // Space
        left: 37, // Left
        up: 38, // Up
        right: 39, // Right
        down: 40, // Down
      }
    },
  };

  // core object - 默认 第一次 执行
  var jm = function(options) {
    jm.current = this;

    this.version = __version__;
    var opts = {};
    jm.util.json.merge(opts, DEFAULT_OPTIONS);
    jm.util.json.merge(opts, options);

    if (!opts.container) {
      logger.error('the options.container should not be null or empty.');
      return;
    }
    this.options = opts;
    this.inited = false;
    this.mind = null;
    this.event_handles = [];
    this.init();
  };

  // ============= static object =============================================
  jm.direction = { left: -1, center: 0, right: 1 };
  jm.event_type = { show: 1, resize: 2, edit: 3, select: 4 };

  jm.node = function(sId, iIndex, sTopic, oData, bIsRoot, oParent, eDirection, bExpanded) {
    if (!sId) { logger.error('invalid nodeid'); return; }
    if (typeof iIndex != 'number') { logger.error('invalid node index'); return; }
    if (typeof bExpanded === 'undefined') { bExpanded = true; }
    this.id = sId;
    this.index = iIndex;
    this.topic = sTopic;
    this.data = oData || {};
    this.isroot = bIsRoot;
    this.parent = oParent;
    this.direction = eDirection;
    this.expanded = !!bExpanded;
    this.children = [];
    this._data = {};
  };

  jm.node.compare = function(node1, node2) {
    // '-1' is alwary the last
    var r = 0;
    var i1 = node1.index;
    var i2 = node2.index;
    if (i1 >= 0 && i2 >= 0) {
      r = i1 - i2;
    } else if (i1 == -1 && i2 == -1) {
      r = 0;
    } else if (i1 == -1) {
      r = 1;
    } else if (i2 == -1) {
      r = -1;
    } else {
      r = 0;
    }
    //logger.debug(i1+' <> '+i2+'  =  '+r);
    return r;
  };

  jm.node.inherited = function(pnode, node) {
    if (!!pnode && !!node) {
      if (pnode.id === node.id) {
        return true;
      }
      if (pnode.isroot) {
        return true;
      }
      var pid = pnode.id;
      var p = node;
      while (!p.isroot) {
        p = p.parent;
        if (p.id === pid) {
          return true;
        }
      }
    }
    return false;
  };

  jm.node.prototype = {
    get_location: function() {
      var vd = this._data.view;
      return {
        x: vd.abs_x,
        y: vd.abs_y
      };
    },
    get_size: function() {
      var vd = this._data.view;
      return {
        w: vd.width,
        h: vd.height
      }
    }
  };


  jm.mind = function() {
    this.name = null;
    this.author = null;
    this.version = null;
    this.root = null;
    this.selected = null;
    this.nodes = {};
  };

  jm.mind.prototype = {
    get_node: function(nodeid) {
      if (nodeid in this.nodes) {
        return this.nodes[nodeid];
      } else {
        logger.warn('the node[id=' + nodeid + '] can not be found');
        return null;
      }
    },

    set_root: function(nodeid, topic, data) {
      if (this.root == null) {
        this.root = new jm.node(nodeid, 0, topic, data, true);
        this._put_node(this.root);
      } else {
        logger.error('root node is already exist');
      }
    },

    add_node: function(parent_node, nodeid, topic, data, idx, direction, expanded) {
      if (!jm.util.is_node(parent_node)) {
        var the_parent_node = this.get_node(parent_node);
        if (!the_parent_node) {
          logger.error('the parent_node[id=' + parent_node + '] can not be found.');
          return null;
        } else {
          return this.add_node(the_parent_node, nodeid, topic, data, idx, direction, expanded);
        }
      }
      var nodeindex = idx || -1;
      var node = null;
      if (parent_node.isroot) {
        var d = jm.direction.right;
        if (!direction || isNaN(direction)) {
          var children = parent_node.children;
          var children_len = children.length;
          var r = 0;
          for (var i = 0; i < children_len; i++) { if (children[i].direction === jm.direction.left) { r--; } else { r++; } }
          d = (children_len > 1 && r > 0) ? jm.direction.left : jm.direction.right;
        } else {
          d = (direction != jm.direction.left) ? jm.direction.right : jm.direction.left;
        }
        node = new jm.node(nodeid, nodeindex, topic, data, false, parent_node, d, expanded);
      } else {
        node = new jm.node(nodeid, nodeindex, topic, data, false, parent_node, parent_node.direction, expanded);
      }
      if (this._put_node(node)) {
        parent_node.children.push(node);
        this._reindex(parent_node);
      } else {
        logger.error('fail, the nodeid \'' + node.id + '\' has been already exist.');
        node = null;
      }
      return node;
    },

    insert_node_before: function(node_before, nodeid, topic, data) {
      if (!jm.util.is_node(node_before)) {
        var the_node_before = this.get_node(node_before);
        if (!the_node_before) {
          logger.error('the node_before[id=' + node_before + '] can not be found.');
          return null;
        } else {
          return this.insert_node_before(the_node_before, nodeid, topic, data);
        }
      }
      var node_index = node_before.index - 0.5;
      return this.add_node(node_before.parent, nodeid, topic, data, node_index);
    },

    get_node_before: function(node) {
      if (!jm.util.is_node(node)) {
        var the_node = this.get_node(node);
        if (!the_node) {
          logger.error('the node[id=' + node + '] can not be found.');
          return null;
        } else {
          return this.get_node_before(the_node);
        }
      }
      if (node.isroot) { return null; }
      var idx = node.index - 2;
      if (idx >= 0) {
        return node.parent.children[idx];
      } else {
        return null;
      }
    },

    insert_node_after: function(node_after, nodeid, topic, data) {
      if (!jm.util.is_node(node_after)) {
        var the_node_after = this.get_node(node_before);
        if (!the_node_after) {
          logger.error('the node_after[id=' + node_after + '] can not be found.');
          return null;
        } else {
          return this.insert_node_after(the_node_after, nodeid, topic, data);
        }
      }
      var node_index = node_after.index + 0.5;
      return this.add_node(node_after.parent, nodeid, topic, data, node_index);
    },

    get_node_after: function(node) {
      if (!jm.util.is_node(node)) {
        var the_node = this.get_node(node);
        if (!the_node) {
          logger.error('the node[id=' + node + '] can not be found.');
          return null;
        } else {
          return this.get_node_after(the_node);
        }
      }
      if (node.isroot) { return null; }
      var idx = node.index;
      var brothers = node.parent.children;
      if (brothers.length >= idx) {
        return node.parent.children[idx];
      } else {
        return null;
      }
    },

    move_node: function(node, beforeid, parentid, direction) {
      if (!jm.util.is_node(node)) {
        var the_node = this.get_node(node);
        if (!the_node) {
          logger.error('the node[id=' + node + '] can not be found.');
          return null;
        } else {
          return this.move_node(the_node, beforeid, parentid, direction);
        }
      }
      if (!parentid) {
        parentid = node.parent.id;
      }
      return this._move_node(node, beforeid, parentid, direction);
    },

    _flow_node_direction: function(node, direction) {
      if (typeof direction === 'undefined') {
        direction = node.direction;
      } else {
        node.direction = direction;
      }
      var len = node.children.length;
      while (len--) {
        this._flow_node_direction(node.children[len], direction);
      }
    },

    _move_node_internal: function(node, beforeid) {
      if (!!node && !!beforeid) {
        if (beforeid == '_last_') {
          node.index = -1;
          this._reindex(node.parent);
        } else if (beforeid == '_first_') {
          node.index = 0;
          this._reindex(node.parent);
        } else {
          var node_before = (!!beforeid) ? this.get_node(beforeid) : null;
          if (node_before != null && node_before.parent != null && node_before.parent.id == node.parent.id) {
            node.index = node_before.index - 0.5;
            this._reindex(node.parent);
          }
        }
      }
      return node;
    },

    _move_node: function(node, beforeid, parentid, direction) {
      if (!!node && !!parentid) {
        if (node.parent.id != parentid) {
          // remove from parent's children
          var sibling = node.parent.children;
          var si = sibling.length;
          while (si--) {
            if (sibling[si].id == node.id) {
              sibling.splice(si, 1);
              break;
            }
          }
          node.parent = this.get_node(parentid);
          node.parent.children.push(node);
        }

        if (node.parent.isroot) {
          if (direction == jsMind.direction.left) {
            node.direction = direction;
          } else {
            node.direction = jm.direction.right;
          }
        } else {
          node.direction = node.parent.direction;
        }
        this._move_node_internal(node, beforeid);
        this._flow_node_direction(node);
      }
      return node;
    },

    remove_node: function(node) {
      if (!jm.util.is_node(node)) {
        var the_node = this.get_node(node);
        if (!the_node) {
          logger.error('the node[id=' + node + '] can not be found.');
          return false;
        } else {
          return this.remove_node(the_node);
        }
      }
      if (!node) {
        logger.error('fail, the node can not be found');
        return false;
      }
      if (node.isroot) {
        logger.error('fail, can not remove root node');
        return false;
      }

      // 清除右上角badge
      $('div.leo-badge[nodeid$="' + node.id + '"]').remove();

      if (this.selected != null && this.selected.id == node.id) {
        this.selected = null;
      }
      // clean all subordinate nodes
      var children = node.children;
      var ci = children.length;
      while (ci--) {
        this.remove_node(children[ci]);
      }
      // clean all children
      children.length = 0;
      // remove from parent's children
      var sibling = node.parent.children;
      var si = sibling.length;
      while (si--) {
        if (sibling[si].id == node.id) {
          sibling.splice(si, 1);
          break;
        }
      }
      // remove from global nodes
      delete this.nodes[node.id];
      // clean all properties
      for (var k in node) {
        delete node[k];
      }
      // remove it's self
      node = null;
      //delete node;
      return true;
    },

    _put_node: function(node) {
      if (node.id in this.nodes) {
        logger.warn('the nodeid \'' + node.id + '\' has been already exist.');
        return false;
      } else {
        this.nodes[node.id] = node;
        return true;
      }
    },

    _reindex: function(node) {
      if (node instanceof jm.node) {
        node.children.sort(jm.node.compare);
        for (var i = 0; i < node.children.length; i++) {
          node.children[i].index = i + 1;
        }
      }
    },
  };

  jm.format = {
    node_tree: {
      example: {
        "meta": {
          "name": __name__,
          "version": __version__
        },
        "format": "node_tree",
        "data": { "id": "root", "topic": "jsMind Example" }
      },
      get_mind: function(source) {
        var df = jm.format.node_tree;
        var mind = new jm.mind();
        mind.name = source.meta.name;
        mind.author = source.meta.author;
        mind.version = source.meta.version;
        df._parse(mind, source.data);
        return mind;
      },
      get_data: function(mind) {
        var df = jm.format.node_tree;
        var json = {};
        json.meta = {
          name: mind.name,
          author: mind.author,
          version: mind.version
        };
        json.format = 'node_tree';
        json.data = df._buildnode(mind.root);
        return json;
      },

      _parse: function(mind, node_root) {
        var df = jm.format.node_tree;
        var data = df._extract_data(node_root);
        mind.set_root(node_root.id, node_root.topic, data);
        if ('children' in node_root) {
          var children = node_root.children;
          for (var i = 0; i < children.length; i++) {
            df._extract_subnode(mind, mind.root, children[i]);
          }
        }
      },

      _extract_data: function(node_json) {
        var data = {};
        for (var k in node_json) {
          if (k == 'id' || k == 'topic' || k == 'children' || k == 'direction' || k == 'expanded') {
            continue;
          }
          data[k] = node_json[k];
        }
        return data;
      },

      _extract_subnode: function(mind, node_parent, node_json) {
        var df = jm.format.node_tree;
        var data = df._extract_data(node_json);
        var d = null;
        if (node_parent.isroot) {
          d = node_json.direction == 'left' ? jm.direction.left : jm.direction.right;
        }
        var node = mind.add_node(node_parent, node_json.id, node_json.topic, data, null, d, node_json.expanded);
        if ('children' in node_json) {
          var children = node_json.children;
          for (var i = 0; i < children.length; i++) {
            df._extract_subnode(mind, node, children[i]);
          }
        }
      },

      _buildnode: function(node) {
        var df = jm.format.node_tree;
        if (!(node instanceof jm.node)) { return; }
        var o = {
          id: node.id,
          topic: node.topic,
          expanded: node.expanded
        };
        if (!!node.parent && node.parent.isroot) {
          o.direction = node.direction == jm.direction.left ? 'left' : 'right';
        }
        if (node.data != null) {
          var node_data = node.data;
          for (var k in node_data) {
            o[k] = node_data[k];
          }
        }
        var children = node.children;
        if (children.length > 0) {
          o.children = [];
          for (var i = 0; i < children.length; i++) {
            o.children.push(df._buildnode(children[i]));
          }
        }
        return o;
      }
    },

    node_array: {
      example: {
        "meta": {
          "name": __name__,
          "version": __version__
        },
        "format": "node_array",
        "data": [
          { "id": "root", "topic": "jsMind Example", "isroot": true }
        ]
      },

      get_mind: function(source) {
        var df = jm.format.node_array;
        var mind = new jm.mind();
        mind.name = source.meta.name;
        mind.author = source.meta.author;
        mind.version = source.meta.version;
        df._parse(mind, source.data);
        return mind;
      },

      get_data: function(mind) {
        var df = jm.format.node_array;
        var json = {};
        json.meta = {
          name: mind.name,
          author: mind.author,
          version: mind.version
        };
        json.format = 'node_array';
        json.data = [];
        df._array(mind, json.data);
        return json;
      },

      _parse: function(mind, node_array) {
        var df = jm.format.node_array;
        var narray = node_array.slice(0);
        // reverse array for improving looping performance
        narray.reverse();
        var root_id = df._extract_root(mind, narray);
        if (!!root_id) {
          df._extract_subnode(mind, root_id, narray);
        } else {
          logger.error('root node can not be found');
        }
      },

      _extract_root: function(mind, node_array) {
        var df = jm.format.node_array;
        var i = node_array.length;
        while (i--) {
          if ('isroot' in node_array[i] && node_array[i].isroot) {
            var root_json = node_array[i];
            var data = df._extract_data(root_json);
            mind.set_root(root_json.id, root_json.topic, data);
            node_array.splice(i, 1);
            return root_json.id;
          }
        }
        return null;
      },

      _extract_subnode: function(mind, parentid, node_array) {
        var df = jm.format.node_array;
        var i = node_array.length;
        var node_json = null;
        var data = null;
        var extract_count = 0;
        while (i--) {
          node_json = node_array[i];
          if (node_json.parentid == parentid) {
            data = df._extract_data(node_json);
            var d = null;
            var node_direction = node_json.direction;
            if (!!node_direction) {
              d = node_direction == 'left' ? jm.direction.left : jm.direction.right;
            }
            mind.add_node(parentid, node_json.id, node_json.topic, data, null, d, node_json.expanded);
            node_array.splice(i, 1);
            extract_count++;
            var sub_extract_count = df._extract_subnode(mind, node_json.id, node_array);
            if (sub_extract_count > 0) {
              // reset loop index after extract subordinate node
              i = node_array.length;
              extract_count += sub_extract_count;
            }
          }
        }
        return extract_count;
      },

      _extract_data: function(node_json) {
        var data = {};
        for (var k in node_json) {
          if (k == 'id' || k == 'topic' || k == 'parentid' || k == 'isroot' || k == 'direction' || k == 'expanded') {
            continue;
          }
          data[k] = node_json[k];
        }
        return data;
      },

      _array: function(mind, node_array) {
        var df = jm.format.node_array;
        df._array_node(mind.root, node_array);
      },

      _array_node: function(node, node_array) {
        var df = jm.format.node_array;
        if (!(node instanceof jm.node)) { return; }
        var o = {
          id: node.id,
          topic: node.topic,
          expanded: node.expanded
        };
        if (!!node.parent) {
          o.parentid = node.parent.id;
        }
        if (node.isroot) {
          o.isroot = true;
        }
        if (!!node.parent && node.parent.isroot) {
          o.direction = node.direction == jm.direction.left ? 'left' : 'right';
        }
        if (node.data != null) {
          var node_data = node.data;
          for (var k in node_data) {
            o[k] = node_data[k];
          }
        }
        node_array.push(o);
        var ci = node.children.length;
        for (var i = 0; i < ci; i++) {
          df._array_node(node.children[i], node_array);
        }
      },
    },

    freemind: {
      example: {
        "meta": {
          "name": __name__,
          "version": __version__
        },
        "format": "freemind",
        "data": "<map version=\"1.0.1\"><node ID=\"root\" TEXT=\"freemind Example\"/></map>"
      },
      get_mind: function(source) {
        var df = jm.format.freemind;
        var mind = new jm.mind();
        mind.name = source.meta.name;
        mind.author = source.meta.author;
        mind.version = source.meta.version;
        var xml = source.data;
        var xml_doc = df._parse_xml(xml);
        var xml_root = df._find_root(xml_doc);
        df._load_node(mind, null, xml_root);
        return mind;
      },

      get_data: function(mind) {
        var df = jm.format.freemind;
        var json = {};
        json.meta = {
          name: mind.name,
          author: mind.author,
          version: mind.version
        };
        json.format = 'freemind';
        var xmllines = [];
        xmllines.push('<map version=\"1.0.1\">');
        df._buildmap(mind.root, xmllines);
        xmllines.push('</map>');
        json.data = xmllines.join(' ');
        return json;
      },

      _parse_xml: function(xml) {
        var xml_doc = null;
        if (window.DOMParser) {
          var parser = new DOMParser();
          xml_doc = parser.parseFromString(xml, 'text/xml');
        } else { // Internet Explorer
          xml_doc = new ActiveXObject('Microsoft.XMLDOM');
          xml_doc.async = false;
          xml_doc.loadXML(xml);
        }
        return xml_doc;
      },

      _find_root: function(xml_doc) {
        var nodes = xml_doc.childNodes;
        var node = null;
        var root = null;
        var n = null;
        for (var i = 0; i < nodes.length; i++) {
          n = nodes[i];
          if (n.nodeType == 1 && n.tagName == 'map') {
            node = n;
            break;
          }
        }
        if (!!node) {
          var ns = node.childNodes;
          node = null;
          for (var i = 0; i < ns.length; i++) {
            n = ns[i];
            if (n.nodeType == 1 && n.tagName == 'node') {
              node = n;
              break;
            }
          }
        }
        return node;
      },

      _load_node: function(mind, parent_id, xml_node) {
        var df = jm.format.freemind;
        var node_id = xml_node.getAttribute('ID');
        var node_topic = xml_node.getAttribute('TEXT');
        // look for richcontent
        if (node_topic == null) {
          var topic_children = xml_node.childNodes;
          var topic_child = null;
          for (var i = 0; i < topic_children.length; i++) {
            topic_child = topic_children[i];
            //logger.debug(topic_child.tagName);
            if (topic_child.nodeType == 1 && topic_child.tagName === 'richcontent') {
              node_topic = topic_child.textContent;
              break;
            }
          }
        }
        var node_data = df._load_attributes(xml_node);
        var node_expanded = ('expanded' in node_data) ? (node_data.expanded == 'true') : true;
        delete node_data.expanded;

        var node_position = xml_node.getAttribute('POSITION');
        var node_direction = null;
        if (!!node_position) {
          node_direction = node_position == 'left' ? jm.direction.left : jm.direction.right;
        }
        //logger.debug(node_position +':'+ node_direction);
        if (!!parent_id) {
          mind.add_node(parent_id, node_id, node_topic, node_data, null, node_direction, node_expanded);
        } else {
          mind.set_root(node_id, node_topic, node_data);
        }
        var children = xml_node.childNodes;
        var child = null;
        for (var i = 0; i < children.length; i++) {
          child = children[i];
          if (child.nodeType == 1 && child.tagName == 'node') {
            df._load_node(mind, node_id, child);
          }
        }
      },

      _load_attributes: function(xml_node) {
        var children = xml_node.childNodes;
        var attr = null;
        var attr_data = {};
        for (var i = 0; i < children.length; i++) {
          attr = children[i];
          if (attr.nodeType == 1 && attr.tagName === 'attribute') {
            attr_data[attr.getAttribute('NAME')] = attr.getAttribute('VALUE');
          }
        }
        return attr_data;
      },

      _buildmap: function(node, xmllines) {
        var df = jm.format.freemind;
        var pos = null;
        if (!!node.parent && node.parent.isroot) {
          pos = node.direction === jm.direction.left ? 'left' : 'right';
        }
        xmllines.push('<node');
        xmllines.push('ID=\"' + node.id + '\"');
        if (!!pos) {
          xmllines.push('POSITION=\"' + pos + '\"');
        }
        xmllines.push('TEXT=\"' + node.topic + '\">');

        // store expanded status as an attribute
        xmllines.push('<attribute NAME=\"expanded\" VALUE=\"' + node.expanded + '\"/>');

        // for attributes
        var node_data = node.data;
        if (node_data != null) {
          for (var k in node_data) {
            xmllines.push('<attribute NAME=\"' + k + '\" VALUE=\"' + node_data[k] + '\"/>');
          }
        }

        // for children
        var children = node.children;
        for (var i = 0; i < children.length; i++) {
          df._buildmap(children[i], xmllines);
        }

        xmllines.push('</node>');
      },
    },
  };

  // ============= utility object =============================================

  jm.util = {
    is_node: function(node) {
      return !!node && node instanceof jm.node;
    },
    ajax: {
      _xhr: function() {
        var xhr = null;
        if (window.XMLHttpRequest) {
          xhr = new XMLHttpRequest();
        } else {
          try {
            xhr = new ActiveXObject('Microsoft.XMLHTTP');
          } catch (e) {}
        }
        return xhr;
      },
      _eurl: function(url) {
        return encodeURIComponent(url);
      },
      request: function(url, param, method, callback, fail_callback) {
        var a = jm.util.ajax;
        var p = null;
        var tmp_param = [];
        for (var k in param) {
          tmp_param.push(a._eurl(k) + '=' + a._eurl(param[k]));
        }
        if (tmp_param.length > 0) {
          p = tmp_param.join('&');
        }
        var xhr = a._xhr();
        if (!xhr) { return; }
        xhr.onreadystatechange = function() {
          if (xhr.readyState == 4) {
            if (xhr.status == 200 || xhr.status == 0) {
              if (typeof callback === 'function') {
                var data = jm.util.json.string2json(xhr.responseText);
                if (data != null) {
                  callback(data);
                } else {
                  callback(xhr.responseText);
                }
              }
            } else {
              if (typeof fail_callback === 'function') {
                fail_callback(xhr);
              } else {
                logger.error('xhr request failed.', xhr);
              }
            }
          }
        }
        method = method || 'GET';
        xhr.open(method, url, true);
        xhr.setRequestHeader('If-Modified-Since', '0');
        if (method == 'POST') {
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
          xhr.send(p);
        } else {
          xhr.send();
        }
      },
      get: function(url, callback) {
        return jm.util.ajax.request(url, {}, 'GET', callback);
      },
      post: function(url, param, callback) {
        return jm.util.ajax.request(url, param, 'POST', callback);
      }
    },

    dom: {
      //target,eventType,handler
      add_event: function(t, e, h) {
        if (!!t.addEventListener) {
          t.addEventListener(e, h, false);
        } else {
          t.attachEvent('on' + e, h);
        }
      }
    },

    canvas: {
      // koringz 修改关联线
      bezierto: function(ctx, x1, y1, x2, y2, fs) {
        ctx.save()
        ctx.beginPath();
        // 防止 进入点的结束 x 大于 出去点的开始 x
        ctx.moveTo(x1-40, y1);
        let xhorizontal = (x1 + (x2 - x1) * 2 / 3)
        let yhorizontal = (y1 + (y2 - y1) * 2 / 3)
        ctx.bezierCurveTo(xhorizontal, y1, x1, y2, x2, y2);

        ctx.setLineDash([2, 3]);
        ctx.stroke();
        ctx.save()

        // Arrow 头部
        // Math.abs()
        var angle = Math.atan2(y2 - Math.abs(yhorizontal), x2 - Math.abs(xhorizontal));
        ctx.translate(x2, y2);

        // 右边
        ctx.rotate(angle + .5);
        ctx.beginPath();
        ctx.moveTo(10, 10);
        ctx.lineTo(0, 0);
        ctx.stroke();

        // 左边
        ctx.rotate(-2);
        ctx.lineTo(0, -10);
        ctx.stroke();
        // ctx.fill(); //箭头封闭图形
        ctx.restore();   //非常有用 \= 恢复到堆的上一个状态，其实这里没什么用。
      },
      lineto: function(ctx, x1, y1, x2, y2, fs) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        if(fs) {
          ctx.strokeStyle = 'red';
          ctx.lineWidth = 2
        }
        ctx.setLineDash([1]);
        ctx.stroke();
      },
      clear: function(ctx, x, y, w, h) {
        ctx.clearRect(x, y, w, h);
      }
    },

    file: {
      read: function(file_data, fn_callback) {
        var reader = new FileReader();
        reader.onload = function() {
          if (typeof fn_callback === 'function') {
            fn_callback(this.result, file_data.name);
          }
        };
        reader.readAsText(file_data);
      },

      save: function(file_data, type, name) {
        var blob;
        if (typeof $w.Blob === 'function') {
          blob = new Blob([file_data], { type: type });
        } else {
          var BlobBuilder = $w.BlobBuilder || $w.MozBlobBuilder || $w.WebKitBlobBuilder || $w.MSBlobBuilder;
          var bb = new BlobBuilder();
          bb.append(file_data);
          blob = bb.getBlob(type);
        }
        if (navigator.msSaveBlob) {
          navigator.msSaveBlob(blob, name);
        } else {
          var URL = $w.URL || $w.webkitURL;
          var bloburl = URL.createObjectURL(blob);
          var anchor = $c('a');
          if ('download' in anchor) {
            anchor.style.visibility = 'hidden';
            anchor.href = bloburl;
            anchor.download = name;
            $d.body.appendChild(anchor);
            var evt = $d.createEvent('MouseEvents');
            evt.initEvent('click', true, true);
            anchor.dispatchEvent(evt);
            $d.body.removeChild(anchor);
          } else {
            location.href = bloburl;
          }
        }
      }
    },

    json: {
      json2string: function(json) {
        if (!!JSON) {
          try {
            var json_str = JSON.stringify(json);
            return json_str;
          } catch (e) {
            logger.warn(e);
            logger.warn('can not convert to string');
            return null;
          }
        }
      },
      string2json: function(json_str) {
        if (!!JSON) {
          try {
            var json = JSON.parse(json_str);
            return json;
          } catch (e) {
            logger.warn(e);
            logger.warn('can not parse to json');
            return null;
          }
        }
      },
      merge: function(b, a) {
        for (var o in a) {
          if (o in b) {
            if (typeof b[o] === 'object' &&
              Object.prototype.toString.call(b[o]).toLowerCase() == '[object object]' &&
              !b[o].length) {
              jm.util.json.merge(b[o], a[o]);
            } else {
              b[o] = a[o];
            }
          } else {
            b[o] = a[o];
          }
        }
        return b;
      }
    },

    uuid: {
      newid: function() {
        return (new Date().getTime().toString(16) + Math.random().toString(16).substr(2)).substr(2, 16);
      }
    },

    text: {
      is_empty: function(s) {
        if (!s) { return true; }
        return s.replace(/\s*/, '').length == 0;
      }
    }
  };

  jm.prototype = {
    init: function() {
      if (this.inited) { return; }
      this.inited = true;

      var opts = this.options;

      var opts_layout = {
        mode: opts.mode,
        hspace: opts.layout.hspace,
        vspace: opts.layout.vspace,
        pspace: opts.layout.pspace
      }
      var opts_view = {
        container: opts.container,
        support_html: opts.support_html,
        hmargin: opts.view.hmargin,
        vmargin: opts.view.vmargin,
        line_width: opts.view.line_width,
        line_color: opts.view.line_color
      };
      // create instance of function provider
      this.data = new jm.data_provider(this);
      this.layout = new jm.layout_provider(this, opts_layout);
      this.view = new jm.view_provider(this, opts_view);
      this.shortcut = new jm.shortcut_provider(this, opts.shortcut);

      this.data.init();
      this.layout.init();
      this.view.init();
      this.shortcut.init();

      this._event_bind();

      jm.init_plugins(this);
    },

    enable_edit: function() {
      this.options.editable = true;
    },

    disable_edit: function() {
      this.options.editable = false;
    },

    // call enable_event_handle('dblclick')
    // options are 'mousedown', 'click', 'dblclick'
    enable_event_handle: function(event_handle) {
      this.options.default_event_handle['enable_' + event_handle + '_handle'] = true;
    },

    // call disable_event_handle('dblclick')
    // options are 'mousedown', 'click', 'dblclick'
    disable_event_handle: function(event_handle) {
      this.options.default_event_handle['enable_' + event_handle + '_handle'] = false;
    },

    get_editable: function() {
      return this.options.editable;
    },

    set_theme: function(theme) {
      var theme_old = this.options.theme;
      this.options.theme = (!!theme) ? theme : null;
      if (theme_old != this.options.theme) {
        this.view.reset_theme();
        this.view.reset_custom_style();
      }
    },
    _event_bind: function() {
      this.view.add_event(this, 'mousedown', this.mousedown_handle);
      this.view.add_event(this, 'click', this.click_handle);
      this.view.add_event(this, 'dblclick', this.dblclick_handle);
    },

    mousedown_handle: function(e) {
      if (!this.options.default_event_handle['enable_mousedown_handle']) {
        return;
      }
      var element = e.target || event.srcElement;
      var nodeid = this.view.get_binded_nodeid(element);
      if (!!nodeid) {
        this.select_node(nodeid);
      } else {
        this.select_clear();
      }
    },

    click_handle: function(e) {
      if (!this.options.default_event_handle['enable_click_handle']) {
        return;
      }

      var element = e.target || event.srcElement;
      var isexpander = this.view.is_expander(element);
      if (isexpander) {
        var nodeid = this.view.get_binded_nodeid(element);
        if (!!nodeid) {
          this.toggle_node(nodeid);
          return;
        }
      }
      // 不可编辑下单机触发关联事件
      if (!this.get_editable()) {
        var onRelation = this.options.onRelation;
        var onFinalRelation = this.options.onFinalRelation;
        var onFinalDeleteRelation = this.options.onFinalDeleteRelation;
        var onDeleteRelation = this.options.onDeleteRelation;
        if (!onRelation || !delete_relation_node)
          return;
        var nodeid = this.view.get_binded_nodeid(element);
        if (!!nodeid) {
          onRelation(this.mind.selected);
          // onFinalRelation(this.mind.selected)
          // onFinalDeleteRelation(this.mind.selected)
          onDeleteRelation(this.mind.selected)
        }
      }

    },

    dblclick_handle: function(e) {
      if (!this.options.default_event_handle['enable_dblclick_handle']) {
        return;
      }
      if (this.get_editable()) {
        var element = e.target || event.srcElement;
        var nodeid = this.view.get_binded_nodeid(element);
        if (!!nodeid) {
          this.begin_edit(nodeid);
        }
      }
    },

    begin_edit: function(node) {
      // debugger
      if (!jm.util.is_node(node)) {
        var the_node = this.get_node(node);
        if (!the_node) {
          logger.error('the node[id=' + node + '] can not be found.');
          return false;
        } else {
          return this.begin_edit(the_node);
        }
      }
      if (this.get_editable()) {
        this.view.edit_node_begin(node);
      } else {
        logger.error('fail, this mind map is not editable.');
        return;
      }
    },

    end_edit: function() {
      this.view.edit_node_end();
    },

    toggle_node: function(node) {
      if (!jm.util.is_node(node)) {
        var the_node = this.get_node(node);
        if (!the_node) {
          logger.error('the node[id=' + node + '] can not be found.');
          return;
        } else {
          return this.toggle_node(the_node);
        }
      }
      if (node.isroot) { return; }
      this.view.save_location(node);
      this.layout.toggle_node(node);
      this.view.relayout();
      this.view.restore_location(node);
    },

    expand_node: function(node) {
      if (!jm.util.is_node(node)) {
        var the_node = this.get_node(node);
        if (!the_node) {
          logger.error('the node[id=' + node + '] can not be found.');
          return;
        } else {
          return this.expand_node(the_node);
        }
      }
      if (node.isroot) { return; }
      this.view.save_location(node);
      this.layout.expand_node(node);
      this.view.relayout();
      this.view.restore_location(node);
    },

    collapse_node: function(node) {
      if (!jm.util.is_node(node)) {
        var the_node = this.get_node(node);
        if (!the_node) {
          logger.error('the node[id=' + node + '] can not be found.');
          return;
        } else {
          return this.collapse_node(the_node);
        }
      }
      if (node.isroot) { return; }
      this.view.save_location(node);
      this.layout.collapse_node(node);
      this.view.relayout();
      this.view.restore_location(node);
    },

    expand_all: function() {
      this.layout.expand_all();
      this.view.relayout();
    },

    collapse_all: function() {
      this.layout.collapse_all();
      this.view.relayout();
    },

    expand_to_depth: function(depth) {
      this.layout.expand_to_depth(depth);
      this.view.relayout();
    },

    _reset: function() {
      this.view.reset();
      this.layout.reset();
      this.data.reset();
    },

    _show: function(mind) {
      var m = mind || jm.format.node_array.example;

      this.mind = this.data.load(m);
      if (!this.mind) {
        logger.error('data.load error');
        return;
      } else {
        logger.debug('data.load ok');
      }

      this.view.load();
      logger.debug('view.load ok');

      this.layout.layout();
      logger.debug('layout.layout ok');

      this.view.show(true);
      logger.debug('view.show ok');

      this.invoke_event_handle(jm.event_type.show, { data: [mind] });
    },

    show: function(mind) {
      this._reset();
      this._show(mind);
    },

    get_meta: function() {
      return {
        name: this.mind.name,
        author: this.mind.author,
        version: this.mind.version
      };
    },

    get_data: function(data_format) {
      var df = data_format || 'node_tree';
      return this.data.get_data(df);
    },

    get_root: function() {
      return this.mind.root;
    },

    get_node: function(nodeid) {
      return this.mind.get_node(nodeid);
    },

    add_node: function(parent_node, nodeid, topic, data) {
      if (this.get_editable()) {
        var node = this.mind.add_node(parent_node, nodeid, topic, data);
        if (!!node) {
          this.view.add_node(node);
          this.layout.layout();
          this.view.show(false);
          this.view.reset_node_custom_style(node);
          this.expand_node(parent_node);
          this.invoke_event_handle(jm.event_type.edit, { evt: 'add_node', data: [parent_node.id, nodeid, topic, data], node: nodeid });
        }
        return node;
      } else {
        logger.error('fail, this mind map is not editable');
        return null;
      }
    },

    insert_node_before: function(node_before, nodeid, topic, data) {
      if (this.get_editable()) {
        var beforeid = jm.util.is_node(node_before) ? node_before.id : node_before;
        var node = this.mind.insert_node_before(node_before, nodeid, topic, data);
        if (!!node) {
          this.view.add_node(node);
          this.layout.layout();
          this.view.show(false);
          this.invoke_event_handle(jm.event_type.edit, { evt: 'insert_node_before', data: [beforeid, nodeid, topic, data], node: nodeid });
        }
        return node;
      } else {
        logger.error('fail, this mind map is not editable');
        return null;
      }
    },

    insert_node_after: function(node_after, nodeid, topic, data) {
      if (this.get_editable()) {
        var afterid = jm.util.is_node(node_after) ? node_after.id : node_after;
        var node = this.mind.insert_node_after(node_after, nodeid, topic, data);
        if (!!node) {
          this.view.add_node(node);
          this.layout.layout();
          this.view.show(false);
          this.invoke_event_handle(jm.event_type.edit, { evt: 'insert_node_after', data: [afterid, nodeid, topic, data], node: nodeid });
        }
        return node;
      } else {
        logger.error('fail, this mind map is not editable');
        return null;
      }
    },

    remove_node: function(node) {
      if (!jm.util.is_node(node)) {
        var the_node = this.get_node(node);
        if (!the_node) {
          logger.error('the node[id=' + node + '] can not be found.');
          return false;
        } else {
          return this.remove_node(the_node);
        }
      }
      if (this.get_editable()) {
        if (node.isroot) {
          logger.error('fail, can not remove root node');
          return false;
        }
        var nodeid = node.id;
        var parentid = node.parent.id;
        var parent_node = this.get_node(parentid);
        this.view.save_location(parent_node);
        this.view.remove_node(node);
        this.mind.remove_node(node);
        this.layout.layout();
        this.view.show(false);
        this.view.restore_location(parent_node);
        this.invoke_event_handle(jm.event_type.edit, { evt: 'remove_node', data: [nodeid], node: parentid });
        return true;
      } else {
        logger.error('fail, this mind map is not editable');
        return false;
      }
    },

    update_node: function(nodeid, topic) {
      if (this.get_editable()) {
        if (jm.util.text.is_empty(topic)) {
          logger.warn('fail, topic can not be empty');
          return;
        }
        var node = this.get_node(nodeid);
        if (!!node) {
          if (node.topic === topic) {
            logger.info('nothing changed');
            this.view.update_node(node);
            return;
          }
          node.topic = topic;
          this.view.update_node(node);
          this.layout.layout();
          this.view.show(false);
          this.invoke_event_handle(jm.event_type.edit, { evt: 'update_node', data: [nodeid, topic], node: nodeid });
        }
      } else {
        logger.error('fail, this mind map is not editable');
        return;
      }
    },

    move_node: function(nodeid, beforeid, parentid, direction) {
      if (this.get_editable()) {
        var node = this.mind.move_node(nodeid, beforeid, parentid, direction);
        if (!!node) {
          this.view.update_node(node);
          this.layout.layout();
          this.view.show(false);
          this.invoke_event_handle(jm.event_type.edit, { evt: 'move_node', data: [nodeid, beforeid, parentid, direction], node: nodeid });
        }
      } else {
        logger.error('fail, this mind map is not editable');
        return;
      }
    },

    select_node: function(node) {
      if (!jm.util.is_node(node)) {
        var the_node = this.get_node(node);
        if (!the_node) {
          logger.error('the node[id=' + node + '] can not be found.');
          return;
        } else {
          return this.select_node(the_node);
        }
      }
      if (!this.layout.is_visible(node)) {
        return;
      }
      this.mind.selected = node;
      this.view.select_node(node);
    },

    get_selected_node: function() {
      if (!!this.mind) {
        return this.mind.selected;
      } else {
        return null;
      }
    },

    select_clear: function() {
      if (!!this.mind) {
        this.mind.selected = null;
        this.view.select_clear();
      }
    },

    is_node_visible: function(node) {
      return this.layout.is_visible(node);
    },

    find_node_before: function(node) {
      if (!jm.util.is_node(node)) {
        var the_node = this.get_node(node);
        if (!the_node) {
          logger.error('the node[id=' + node + '] can not be found.');
          return;
        } else {
          return this.find_node_before(the_node);
        }
      }
      if (node.isroot) { return null; }
      var n = null;
      if (node.parent.isroot) {
        var c = node.parent.children;
        var prev = null;
        var ni = null;
        for (var i = 0; i < c.length; i++) {
          ni = c[i];
          if (node.direction === ni.direction) {
            if (node.id === ni.id) {
              n = prev;
            }
            prev = ni;
          }
        }
      } else {
        n = this.mind.get_node_before(node);
      }
      return n;
    },

    find_node_after: function(node) {
      if (!jm.util.is_node(node)) {
        var the_node = this.get_node(node);
        if (!the_node) {
          logger.error('the node[id=' + node + '] can not be found.');
          return;
        } else {
          return this.find_node_after(the_node);
        }
      }
      if (node.isroot) { return null; }
      var n = null;
      if (node.parent.isroot) {
        var c = node.parent.children;
        var getthis = false;
        var ni = null;
        for (var i = 0; i < c.length; i++) {
          ni = c[i];
          if (node.direction === ni.direction) {
            if (getthis) {
              n = ni;
              break;
            }
            if (node.id === ni.id) {
              getthis = true;
            }
          }
        }
      } else {
        n = this.mind.get_node_after(node);
      }
      return n;
    },

    set_node_color: function(nodeid, bgcolor, fgcolor) {
      if (this.get_editable()) {
        var node = this.mind.get_node(nodeid);
        if (!!node) {
          if (!!bgcolor) {
            node.data['background-color'] = bgcolor;
          }
          if (!!fgcolor) {
            node.data['foreground-color'] = fgcolor;
          }
          this.view.reset_node_custom_style(node);
        }
      } else {
        logger.error('fail, this mind map is not editable');
        return null;
      }
    },

    set_node_font_style: function(nodeid, size, weight, style) {
      if (this.get_editable()) {
        var node = this.mind.get_node(nodeid);
        if (!!node) {
          if (!!size) {
            node.data['font-size'] = size;
          }
          if (!!weight) {
            node.data['font-weight'] = weight;
          }
          if (!!style) {
            node.data['font-style'] = style;
          }
          this.view.reset_node_custom_style(node);
          this.view.update_node(node);
          this.layout.layout();
          this.view.show(false);
        }
      } else {
        logger.error('fail, this mind map is not editable');
        return null;
      }
    },

    set_node_background_image: function(nodeid, image, width, height, rotation) {
      if (this.get_editable()) {
        var node = this.mind.get_node(nodeid);
        if (!!node) {
          if (!!image) {
            node.data['background-image'] = image;
          }
          if (!!width) {
            node.data['width'] = width;
          }
          if (!!height) {
            node.data['height'] = height;
          }
          if (!!rotation) {
            node.data['background-rotation'] = rotation;
          }
          this.view.reset_node_custom_style(node);
          this.view.update_node(node);
          this.layout.layout();
          this.view.show(false);
        }
      } else {
        logger.error('fail, this mind map is not editable');
        return null;
      }
    },


    // koringz 新添加方法
    link_node: function () {
        this.layout.layout();
        this.view.show(false);
    },

    set_node_background_rotation: function(nodeid, rotation) {
      if (this.get_editable()) {
        var node = this.mind.get_node(nodeid);
        if (!!node) {
          if (!node.data['background-image']) {
            logger.error('fail, only can change rotation angle of node with background image');
            return null;
          }
          node.data['background-rotation'] = rotation;
          this.view.reset_node_custom_style(node);
          this.view.update_node(node);
          this.layout.layout();
          this.view.show(false);
        }
      } else {
        logger.error('fail, this mind map is not editable');
        return null;
      }
    },

    resize: function() {
      this.view.resize();
    },

    // callback(type ,data)
    add_event_listener: function(callback) {
      if (typeof callback === 'function') {
        this.event_handles.push(callback);
      }
    },

    invoke_event_handle: function(type, data) {
      var j = this;
      $w.setTimeout(function() {
        j._invoke_event_handle(type, data);
      }, 0);
    },

    _invoke_event_handle: function(type, data) {
      var l = this.event_handles.length;
      for (var i = 0; i < l; i++) {
        this.event_handles[i](type, data);
      }

      // koringz 获取 data 数据
      // 回调获得数据方法
      this.options.onKoringzData.call(this, type, data)
      console.log('event loop finally， doing something.')
    }

  };

  // ============= data provider =============================================

  jm.data_provider = function(jm) {
    this.jm = jm;
  };

  jm.data_provider.prototype = {

    init: function() {
      logger.debug('data.init');
    },

    reset: function() {
      logger.debug('data.reset');
    },

    // koringz
    load: function(mind_data) {
      var df = null;
      var mind = null;
      if (typeof mind_data === 'object') {
        if (!!mind_data.format) {
          df = mind_data.format;
        } else {
          df = 'node_tree';
        }
      } else {
        df = 'freemind';
      }

      // debugger
      // 强制改规则 为 树形结构
      df = 'node_tree'
      if (df == 'node_array') {
        mind = jm.format.node_array.get_mind(mind_data);
      } else if (df == 'node_tree') {
        mind = jm.format.node_tree.get_mind(mind_data);
      } else if (df == 'freemind') {
        mind = jm.format.freemind.get_mind(mind_data);
      } else {
        logger.warn('unsupported format');
      }
      return mind;
    },

    get_data: function(data_format) {
      var data = null;
      if (data_format == 'node_array') {
        data = jm.format.node_array.get_data(this.jm.mind);
      } else if (data_format == 'node_tree') {
        data = jm.format.node_tree.get_data(this.jm.mind);
      } else if (data_format == 'freemind') {
        data = jm.format.freemind.get_data(this.jm.mind);
      } else {
        logger.error('unsupported ' + data_format + ' format');
      }
      return data;
    },
  };

  // ============= layout provider ===========================================

  jm.layout_provider = function(jm, options) {
    this.opts = options;
    this.jm = jm;
    this.isside = (this.opts.mode == 'side');
    this.bounds = null;

    this.cache_valid = false;
  };

  jm.layout_provider.prototype = {
    init: function() {
      logger.debug('layout.init');
    },
    reset: function() {
      logger.debug('layout.reset');
      this.bounds = { n: 0, s: 0, w: 0, e: 0 };
    },
    layout: function() {
      logger.debug('layout.layout');
      this.layout_direction();
      this.layout_offset();
    },

    layout_direction: function() {
      this._layout_direction_root();
    },

    _layout_direction_root: function() {
      var node = this.jm.mind.root;
      // logger.debug(node);
      var layout_data = null;
      if ('layout' in node._data) {
        layout_data = node._data.layout;
      } else {
        layout_data = {};
        node._data.layout = layout_data;
      }
      var children = node.children;
      var children_count = children.length;
      layout_data.direction = jm.direction.center;
      layout_data.side_index = 0;
      if (this.isside) {
        var i = children_count;
        while (i--) {
          this._layout_direction_side(children[i], jm.direction.right, i);
        }
      } else {
        var i = children_count;
        var subnode = null;
        while (i--) {
          subnode = children[i];
          if (subnode.direction == jm.direction.left) {
            this._layout_direction_side(subnode, jm.direction.right, i);
          } else {
            this._layout_direction_side(subnode, jm.direction.right, i);
          }
        }
        /*
         var boundary = Math.ceil(children_count/2);
         var i = children_count;
         while(i--){
         if(i>=boundary){
         this._layout_direction_side(children[i],jm.direction.left, children_count-i-1);
         }else{
         this._layout_direction_side(children[i],jm.direction.right, i);
         }
         }*/

      }
    },

    _layout_direction_side: function(node, direction, side_index) {
      var layout_data = null;
      if ('layout' in node._data) {
        layout_data = node._data.layout;
      } else {
        layout_data = {};
        node._data.layout = layout_data;
      }
      var children = node.children;
      var children_count = children.length;

      layout_data.direction = direction;
      layout_data.side_index = side_index;
      var i = children_count;
      while (i--) {
        this._layout_direction_side(children[i], direction, i);
      }
    },

    layout_offset: function() {
      var node = this.jm.mind.root;
      var layout_data = node._data.layout;
      layout_data.offset_x = 0;
      layout_data.offset_y = 0;
      layout_data.outer_height = 0;
      var children = node.children;
      var i = children.length;
      var left_nodes = [];
      var right_nodes = [];
      var subnode = null;
      while (i--) {
        subnode = children[i];
        if (subnode._data.layout.direction == jm.direction.right) {
          right_nodes.unshift(subnode);
        } else {
          left_nodes.unshift(subnode);
        }
      }
      layout_data.left_nodes = left_nodes;
      layout_data.right_nodes = right_nodes;
      layout_data.outer_height_left = this._layout_offset_subnodes(left_nodes);
      layout_data.outer_height_right = this._layout_offset_subnodes(right_nodes);
      this.bounds.e = node._data.view.width / 2;
      this.bounds.w = 0 - this.bounds.e;
      //logger.debug(this.bounds.w);
      this.bounds.n = 0;
      this.bounds.s = Math.max(layout_data.outer_height_left, layout_data.outer_height_right);
    },

    // layout both the x and y axis
    _layout_offset_subnodes: function(nodes) {
      var total_height = 0;
      var nodes_count = nodes.length;
      var i = nodes_count;
      var node = null;
      var node_outer_height = 0;
      var layout_data = null;
      var base_y = 0;
      var pd = null; // parent._data
      while (i--) {
        node = nodes[i];
        layout_data = node._data.layout;
        if (pd == null) {
          pd = node.parent._data;
        }

        node_outer_height = this._layout_offset_subnodes(node.children);
        if (!node.expanded) {
          node_outer_height = 0;
          this.set_visible(node.children, false);
        }
        node_outer_height = Math.max(node._data.view.height, node_outer_height);

        layout_data.outer_height = node_outer_height;
        layout_data.offset_y = base_y - node_outer_height / 2;
        layout_data.offset_x = this.opts.hspace * layout_data.direction + pd.view.width * (pd.layout.direction + layout_data.direction) / 2;
        if (!node.parent.isroot) {
          layout_data.offset_x += this.opts.pspace * layout_data.direction;
        }

        base_y = base_y - node_outer_height - this.opts.vspace;
        total_height += node_outer_height;
      }
      if (nodes_count > 1) {
        total_height += this.opts.vspace * (nodes_count - 1);
      }
      i = nodes_count;
      var middle_height = total_height / 2;
      while (i--) {
        node = nodes[i];
        node._data.layout.offset_y += middle_height;
      }
      return total_height;
    },

    // layout the y axis only, for collapse/expand a node
    _layout_offset_subnodes_height: function(nodes) {
      var total_height = 0;
      var nodes_count = nodes.length;
      var i = nodes_count;
      var node = null;
      var node_outer_height = 0;
      var layout_data = null;
      var base_y = 0;
      var pd = null; // parent._data
      while (i--) {
        node = nodes[i];
        layout_data = node._data.layout;
        if (pd == null) {
          pd = node.parent._data;
        }

        node_outer_height = this._layout_offset_subnodes_height(node.children);
        if (!node.expanded) {
          node_outer_height = 0;
        }
        node_outer_height = Math.max(node._data.view.height, node_outer_height);

        layout_data.outer_height = node_outer_height;
        layout_data.offset_y = base_y - node_outer_height / 2;
        base_y = base_y - node_outer_height - this.opts.vspace;
        total_height += node_outer_height;
      }
      if (nodes_count > 1) {
        total_height += this.opts.vspace * (nodes_count - 1);
      }
      i = nodes_count;
      var middle_height = total_height / 2;
      while (i--) {
        node = nodes[i];
        node._data.layout.offset_y += middle_height;
        //logger.debug(node.topic);
        //logger.debug(node._data.layout.offset_y);
      }
      return total_height;
    },

    // == koringz将会 计算 关联线
    get_node_offset: function(node) {
      var layout_data = node._data.layout;
      var offset_cache = null;
      // debugger
      if (('_offset_' in layout_data) && this.cache_valid) {
        offset_cache = layout_data._offset_;
      } else {
        offset_cache = { x: -1, y: -1 };
        layout_data._offset_ = offset_cache;
      }
      if (offset_cache.x == -1 || offset_cache.y == -1) {
        var x = layout_data.offset_x;
        var y = layout_data.offset_y;
        if (!node.isroot) {
          var offset_p = this.get_node_offset(node.parent);
          x += offset_p.x;
          y += offset_p.y;
        }
        offset_cache.x = x;
        offset_cache.y = y;
      }
      return offset_cache;
    },

    get_node_point: function(node) {
      var view_data = node._data.view;
      var offset_p = this.get_node_offset(node);
      //logger.debug(offset_p);
      var p = {};
      p.x = offset_p.x + view_data.width * (node._data.layout.direction - 1) / 2;
      p.y = offset_p.y - view_data.height / 2;
      //logger.debug(p);
      return p;
    },

    get_node_point_in: function(node) {
      var p = this.get_node_offset(node);
      return p;
    },
    get_node_point_out: function(node) {
      var layout_data = node._data.layout;
      var pout_cache = null;
      if (('_pout_' in layout_data) && this.cache_valid) {
        pout_cache = layout_data._pout_;
      } else {
        pout_cache = { x: -1, y: -1 };
        layout_data._pout_ = pout_cache;
      }
      if (pout_cache.x == -1 || pout_cache.y == -1) {
        if (node.isroot) {
          pout_cache.x = 0;
          pout_cache.y = 0;
        } else {
          var view_data = node._data.view;
          var offset_p = this.get_node_offset(node);
          pout_cache.x = offset_p.x + (view_data.width + this.opts.pspace) * node._data.layout.direction;
          pout_cache.y = offset_p.y;
          //logger.debug('pout');
          //logger.debug(pout_cache);
        }
      }
      return pout_cache;
    },

    get_expander_point: function(node) {
      var p = this.get_node_point_out(node);
      var ex_p = {};
      if (node._data.layout.direction == jm.direction.right) {
        ex_p.x = p.x - this.opts.pspace;
      } else {
        ex_p.x = p.x;
      }
      ex_p.y = p.y - Math.ceil(this.opts.pspace / 2);
      return ex_p;
    },

    get_min_size: function() {
      var nodes = this.jm.mind.nodes;
      var node = null;
      var pout = null;
      for (var nodeid in nodes) {
        node = nodes[nodeid];
        if (node.parent && !node.parent.expanded) {
          continue;
        }
        pout = this.get_node_point_out(node);
        //logger.debug(pout.x);
        if (pout.x > this.bounds.e) { this.bounds.e = pout.x; }
        if (pout.x < this.bounds.w) { this.bounds.w = pout.x; }
      }
      return {
        w: this.bounds.e - this.bounds.w,
        h: this.bounds.s - this.bounds.n
      }
    },

    toggle_node: function(node) {
      if (node.isroot) {
        return;
      }
      if (node.expanded) {
        this.collapse_node(node);
      } else {
        this.expand_node(node);
      }
    },
    // 展开节点
    expand_node: function(node) {
      node.expanded = true;
      this.part_layout(node);
      this.set_visible(node.children, true);
      this.toggleBadge(node.children, true);
    },
    // 收叠节点
    collapse_node: function(node) {
      node.expanded = false;
      this.part_layout(node);
      this.set_visible(node.children, false);
      this.toggleBadge(node.children, false);
    },
    // 隐藏/显示 badger
    // true: 显示
    // false: 隐藏
    toggleBadge: function(nodes, isShow) {
      // console.log(isShow === true ? '显示' : '隐藏', nodes)
      var that = this;

      nodes.forEach(function(e) {
        // var visible = e._data.layout.visible
        var visible = that.jm.is_node_visible(e);
        // console.log('visible', visible)
        if (visible === true) return true;
        // 多层级显示隐藏
        that.toggleBadge(e.children, isShow);
        var $ele = $('div.leo-badge[nodeid$="' + e.id + '"]');
        if (isShow === true) {
          $ele.show();
        } else {
          $ele.hide();
        }
      });
    },

    expand_all: function() {
      var nodes = this.jm.mind.nodes;
      var c = 0;
      var node;
      for (var nodeid in nodes) {
        node = nodes[nodeid];
        if (!node.expanded) {
          node.expanded = true;
          c++;
        }
      }
      if (c > 0) {
        var root = this.jm.mind.root;
        this.part_layout(root);
        this.set_visible(root.children, true);
      }
    },

    collapse_all: function() {
      var nodes = this.jm.mind.nodes;
      var c = 0;
      var node;
      for (var nodeid in nodes) {
        node = nodes[nodeid];
        if (node.expanded && !node.isroot) {
          node.expanded = false
          c++;
        }
      }
      if (c > 0) {
        var root = this.jm.mind.root;
        this.part_layout(root);
        this.set_visible(root.children, true);
      }
    },

    expand_to_depth: function(target_depth, curr_nodes, curr_depth) {
      if (target_depth < 1) { return; }
      var nodes = curr_nodes || this.jm.mind.root.children;
      var depth = curr_depth || 1;
      var i = nodes.length;
      var node = null;
      while (i--) {
        node = nodes[i];
        if (depth < target_depth) {
          if (!node.expanded) {
            this.expand_node(node);
          }
          this.expand_to_depth(target_depth, node.children, depth + 1);
        }
        if (depth == target_depth) {
          if (node.expanded) {
            this.collapse_node(node);
          }
        }
      }
    },

    part_layout: function(node) {
      var root = this.jm.mind.root;
      if (!!root) {
        var root_layout_data = root._data.layout;
        if (node.isroot) {
          root_layout_data.outer_height_right = this._layout_offset_subnodes_height(root_layout_data.right_nodes);
          root_layout_data.outer_height_left = this._layout_offset_subnodes_height(root_layout_data.left_nodes);
        } else {
          if (node._data.layout.direction == jm.direction.right) {
            root_layout_data.outer_height_right = this._layout_offset_subnodes_height(root_layout_data.right_nodes);
          } else {
            root_layout_data.outer_height_left = this._layout_offset_subnodes_height(root_layout_data.left_nodes);
          }
        }
        this.bounds.s = Math.max(root_layout_data.outer_height_left, root_layout_data.outer_height_right);
        this.cache_valid = false;
      } else {
        logger.warn('can not found root node');
      }
    },

    set_visible: function(nodes, visible) {
      var i = nodes.length;
      var node = null;
      var layout_data = null;
      while (i--) {
        node = nodes[i];
        layout_data = node._data.layout;
        if (node.expanded) {
          this.set_visible(node.children, visible);
        } else {
          this.set_visible(node.children, false);
        }
        if (!node.isroot) {
          node._data.layout.visible = visible;
        }
      }
    },

    is_expand: function(node) {
      return node.expanded;
    },

    is_visible: function(node) {
      var layout_data = node._data.layout;
      if (('visible' in layout_data) && !layout_data.visible) {
        return false;
      } else {
        return true;
      }
    },
  };

  // view provider
  jm.view_provider = function(jm, options) {
    this.opts = options;
    this.jm = jm;
    this.layout = jm.layout;

    this.container = null;
    this.e_panel = null;
    this.e_nodes = null;
    this.e_canvas = null;

    this.canvas_ctx = null;
    this.size = { w: 0, h: 0 };

    this.selected_node = null;
    this.editing_node = null;
  };

  // koringz无修改 / input 编辑
  jm.view_provider.prototype = {
    init: function() {
      logger.debug('view.init');

      this.container = $i(this.opts.container) ? this.opts.container : $g(this.opts.container);
      if (!this.container) {
        logger.error('the options.view.container was not be found in dom');
        return;
      }
      this.e_panel = $c('div');
      this.e_canvas = $c('canvas');
      this.e_nodes = $c('jmnodes');
      // 注意这个编辑 input 在此 绑定事件
      this.e_editor = $c('textarea');
      // debugger

      this.e_panel.className = 'jsmind-inner';
      this.e_panel.appendChild(this.e_canvas);
      this.e_panel.appendChild(this.e_nodes);

      this.e_editor.className = 'jsmind-editor';
      // this.e_editor.type = 'text';

      this.actualZoom = 1;
      this.zoomStep = 0.1;
      this.minZoom = 0.5;
      this.maxZoom = 2;

      var v = this;
      jm.util.dom.add_event(this.e_editor, 'keydown', function(e) {
        var evt = e || event;
        if (evt.keyCode == 13) {
          v.edit_node_end();
          evt.stopPropagation();
        }
      });
      // koringz 编辑 输入
      jm.util.dom.add_event(this.e_editor, 'blur', function(e) {
        // koringz 编辑结束
        // 第一个 this
        // 第二个 事件目标 target
        // 第三个 回调函数 
        kmsjsmap.onEditeNodeData(v, e, function () {
          v.edit_node_end();
        })
      });

      this.container.appendChild(this.e_panel);

      this.init_canvas();
    },

    add_event: function(obj, event_name, event_handle) {
      jm.util.dom.add_event(this.e_nodes, event_name, function(e) {
        var evt = e || event;
        event_handle.call(obj, evt);
      });
    },

    get_binded_nodeid: function(element) {
      if (element == null) {
        return null;
      }
      var tagName = element.tagName.toLowerCase();
      if (tagName == 'jmnodes' || tagName == 'body' || tagName == 'html') {
        return null;
      }
      if (tagName == 'jmnode' || tagName == 'jmexpander') {
        return element.getAttribute('nodeid');
      } else {
        return this.get_binded_nodeid(element.parentElement);
      }
    },

    is_expander: function(element) {
      return (element.tagName.toLowerCase() == 'jmexpander');
    },

    reset: function() {
      logger.debug('view.reset');
      this.selected_node = null;
      this.clear_lines();
      this.clear_nodes();
      this.reset_theme();
    },

    reset_theme: function() {
      var theme_name = this.jm.options.theme;
      if (!!theme_name) {
        this.e_nodes.className = 'theme-' + theme_name;
      } else {
        this.e_nodes.className = '';
      }
    },

    reset_custom_style: function() {
      var nodes = this.jm.mind.nodes;
      for (var nodeid in nodes) {
        this.reset_node_custom_style(nodes[nodeid]);
      }
    },

    load: function() {
      logger.debug('view.load');
      this.init_nodes();
    },

    expand_size: function() {
      var min_size = this.layout.get_min_size();
      var min_width = min_size.w + this.opts.hmargin * 2;
      var min_height = min_size.h + this.opts.vmargin * 2;
      var client_w = this.e_panel.clientWidth;
      var client_h = this.e_panel.clientHeight;
      if (client_w < min_width) { client_w = min_width; }
      if (client_h < min_height) { client_h = min_height; }
      this.size.w = client_w;
      this.size.h = client_h;
    },

    init_canvas: function() {
      var ctx = this.e_canvas.getContext('2d');
      this.canvas_ctx = ctx;
    },

    init_nodes_size: function(node) {
      var view_data = node._data.view;
      view_data.width = view_data.element.clientWidth;
      view_data.height = view_data.element.clientHeight;
    },

    init_nodes: function() {
      var nodes = this.jm.mind.nodes;
      var doc_frag = $d.createDocumentFragment();
      for (var nodeid in nodes) {
        this.create_node_element(nodes[nodeid], doc_frag);
      }
      this.e_nodes.appendChild(doc_frag);
      for (var nodeid in nodes) {
        this.init_nodes_size(nodes[nodeid]);
      }
    },

    add_node: function(node) {
      this.create_node_element(node, this.e_nodes);
      this.init_nodes_size(node);
    },

    create_node_element: function(node, parent_node) {
      var view_data = null;
      if ('view' in node._data) {
        view_data = node._data.view;
      } else {
        view_data = {};
        node._data.view = view_data;
      }

      var d = $c('jmnode');
      if (node.isroot) {
        d.className = 'root';
      } else {
        var d_e = $c('jmexpander'); // 右侧的小东西
        $t(d_e, '-');
        d_e.setAttribute('nodeid', node.id);
        d_e.style.visibility = 'hidden';
        parent_node.appendChild(d_e);
        view_data.expander = d_e;
      }
      if (!!node.topic) {
        if (this.opts.support_html) {
          $h(d, node.topic);
        } else {
          $t(d, node.topic);
        }
      }

      // 创建右上角的小图标 雕漆里
      var badge = $c('div');
      badge.className = 'leo-badge'
      parent_node.appendChild(badge);
      $t(badge, node._data.badge)
      badge.setAttribute('nodeid', node.id);
      badge.style.visibility = 'hidden';
      view_data.badge = badge;


      d.setAttribute('nodeid', node.id);
      d.style.visibility = 'hidden';

      // 设置node节点的链接图标
      if (node.data.isLink === true) {
        $(d).addClass('isLink')
      } else {
        $(d).removeClass('isLink')
      }


      this._reset_node_custom_style(d, node.data);

      parent_node.appendChild(d);
      view_data.element = d;
    },

    remove_node: function(node) {
      if (this.selected_node != null && this.selected_node.id == node.id) {
        this.selected_node = null;
      }
      if (this.editing_node != null && this.editing_node.id == node.id) {
        node._data.view.element.removeChild(this.e_editor);
        this.editing_node = null;
      }
      var children = node.children;
      var i = children.length;
      while (i--) {
        this.remove_node(children[i]);
      }
      if (node._data.view) {
        var element = node._data.view.element;
        var expander = node._data.view.expander;
        this.e_nodes.removeChild(element);
        this.e_nodes.removeChild(expander);
        node._data.view.element = null;
        node._data.view.expander = null;
      }
    },

    update_node: function(node) {
      var view_data = node._data.view;
      var element = view_data.element;
      if (!!node.topic) {
        if (this.opts.support_html) {
          $h(element, node.topic);
        } else {
          $t(element, node.topic);
        }
      }
      view_data.width = element.clientWidth;
      view_data.height = element.clientHeight;
    },

    // koringz 修改 下载文件 添加 isFile 
    select_node: function(node) {
      if (!!this.selected_node) {
        this.selected_node._data.view.element.className =
          this.selected_node._data.view.element.className.replace(/\s*selected\b/i, '');
        this.reset_node_custom_style(this.selected_node);
      }
      if (!!node) {
        if(node.data.isFile) return false;
        this.selected_node = node;
        node._data.view.element.className += ' selected';
        this.clear_node_custom_style(node);
      }
    },

    select_clear: function() {
      this.select_node(null);
    },

    get_editing_node: function() {
      return this.editing_node;
    },

    is_editing: function() {
      return (!!this.editing_node);
    },

    edit_node_begin: function(node) {
      // debugger
      if (!node.topic) {
        logger.warn("don't edit image nodes");
        return;
      }
      if (this.editing_node != null) {
        this.edit_node_end();
      }
      this.editing_node = node;
      var view_data = node._data.view;
      var element = view_data.element;
      var topic = node.topic;
      var ncs = getComputedStyle(element);
      this.e_editor.value = topic;
      // this.e_editor.style.width = (element.clientWidth - parseInt(ncs.getPropertyValue('padding-left')) - parseInt(ncs.getPropertyValue('padding-right'))) + 'px';
      this.e_editor.style.width = 380 +'px';
      this.e_editor.style.minHeight = 200 +'px';
      element.innerHTML = '';
      element.appendChild(this.e_editor);
      element.style.zIndex = 5;
      this.e_editor.focus();
      this.e_editor.select();
    },

    edit_node_end: function() {
      if (this.editing_node != null) {
        var node = this.editing_node;
        this.editing_node = null;
        var view_data = node._data.view;
        var element = view_data.element;
        var topic = this.e_editor.value;
        element.style.zIndex = 'auto';
        element.removeChild(this.e_editor);
        if (jm.util.text.is_empty(topic) || node.topic === topic) {
          if (this.opts.support_html) {
            $h(element, node.topic);
          } else {
            $t(element, node.topic);
          }
        } else {
          // debugger koringz 更新编辑数据
          this.jm.update_node(node.id, topic);
        }
      }
    },

    get_view_offset: function() {
      var bounds = this.layout.bounds;
      var _x = (this.size.w - bounds.e - bounds.w) / 2;
      var _y = this.size.h / 2;
      return { x: _x, y: _y };
    },

    resize: function() {
      this.e_canvas.width = 1;
      this.e_canvas.height = 1;
      this.e_nodes.style.width = '1px';
      this.e_nodes.style.height = '1px';

      this.expand_size();
      this._show();
    },

    _show: function() {
      this.e_canvas.width = this.size.w;
      this.e_canvas.height = this.size.h;
      this.e_nodes.style.width = this.size.w + 'px';
      this.e_nodes.style.height = this.size.h + 'px';
      this.show_nodes();
      this.show_lines();
      //this.layout.cache_valid = true;
      this.jm.invoke_event_handle(jm.event_type.resize, { data: [] });
    },

    zoomIn: function() {
      return this.setZoom(this.actualZoom + this.zoomStep);
    },

    zoomOut: function() {
      return this.setZoom(this.actualZoom - this.zoomStep);
    },

    setZoom: function(zoom) {
      if ((zoom < this.minZoom) || (zoom > this.maxZoom)) {
        return false;
      }
      this.actualZoom = zoom;
      for (var i = 0; i < this.e_panel.children.length; i++) {
        this.e_panel.children[i].style.transform = 'scale(' + zoom + ')';
        this.e_panel.children[i].style["-ms-transform"] = 'scale(' + zoom + ')';
      };
      this.show(true);
      return true;

    },

    _center_root: function() {
      // center root node
      var outer_w = this.e_panel.clientWidth;
      var outer_h = this.e_panel.clientHeight;
      if (this.size.w > outer_w) {
        var _offset = this.get_view_offset();
        this.e_panel.scrollLeft = _offset.x - outer_w / 2;
      }
      if (this.size.h > outer_h) {
        this.e_panel.scrollTop = (this.size.h - outer_h) / 2;
      }
    },

    show: function(keep_center) {
      logger.debug('view.show');
      this.expand_size();
      this._show();
      if (!!keep_center) {
        this._center_root();
      }
    },

    relayout: function() {
      this.expand_size();
      this._show();
    },

    save_location: function(node) {
      var vd = node._data.view;
      vd._saved_location = {
        x: parseInt(vd.element.style.left) - this.e_panel.scrollLeft,
        y: parseInt(vd.element.style.top) - this.e_panel.scrollTop,
      };
    },

    restore_location: function(node) {
      var vd = node._data.view;
      this.e_panel.scrollLeft = parseInt(vd.element.style.left) - vd._saved_location.x;
      this.e_panel.scrollTop = parseInt(vd.element.style.top) - vd._saved_location.y;
    },

    clear_nodes: function() {
      var mind = this.jm.mind;
      if (mind == null) {
        return;
      }
      var nodes = mind.nodes;
      var node = null;
      for (var nodeid in nodes) {
        node = nodes[nodeid];
        node._data.view.element = null;
        node._data.view.expander = null;
      }
      this.e_nodes.innerHTML = '';
    },

    show_nodes: function() {
      var nodes = this.jm.mind.nodes;
      var node = null;
      var node_element = null;
      var expander = null;
      var p = null;
      var p_expander = null;
      var expander_text = '-';
      var view_data = null;
      var _offset = this.get_view_offset();
      for (var nodeid in nodes) {
        node = nodes[nodeid];
        view_data = node._data.view;
        node_element = view_data.element;
        expander = view_data.expander;
        if (!this.layout.is_visible(node)) {
          node_element.style.display = 'none';
          expander.style.display = 'none';
          continue;
        }
        this.reset_node_custom_style(node);
        p = this.layout.get_node_point(node);
        view_data.abs_x = _offset.x + p.x;
        view_data.abs_y = _offset.y + p.y;
        node_element.style.left = (_offset.x + p.x) + 'px';
        node_element.style.top = (_offset.y + p.y) + 'px';
        node_element.style.display = '';
        node_element.style.visibility = 'visible';

        p_expander = this.layout.get_expander_point(node);

        // 创建右侧expander收缩按钮
        if (!node.isroot && node.children.length > 0) {
          expander_text = node.expanded ? '-' : '+';
          expander.style.left = (_offset.x + p_expander.x) + 'px';
          expander.style.top = (_offset.y + p_expander.y) + 'px';
          expander.style.display = '';
          expander.style.visibility = 'visible';
          $t(expander, expander_text);
        }
        // 当下面已经没有children时，隐藏expander收缩按钮
        if (!node.isroot && node.children.length == 0) {
          expander.style.display = 'none';
          expander.style.visibility = 'hidden';
        }
        // 创建右上角的小图标 丢那妈
        if (!node.data.badge || node.data.badge < 1) continue;
        var badge = view_data.badge;
        badge.style.left = (_offset.x + p_expander.x - 10) + 'px';
        badge.style.top = (_offset.y + p_expander.y - 20) + 'px';
        badge.style.display = '';
        badge.style.visibility = 'visible';
        $t(badge, node.data.badge);
      }
    },

    reset_node_custom_style: function(node) {
      this._reset_node_custom_style(node._data.view.element, node.data);
    },

    // koringz 添加 下载链接
    _reset_node_custom_style: function(node_element, node_data) {
      if ('background-color' in node_data) {
        node_element.style.backgroundColor = node_data['background-color'];
      }
      if ('foreground-color' in node_data) {
        node_element.style.color = node_data['foreground-color'];
      }
      if ('width' in node_data) {
        node_element.style.width = node_data['width'] + 'px';
      }
      if ('height' in node_data) {
        node_element.style.height = node_data['height'] + 'px';
      }
      if ('font-size' in node_data) {
        node_element.style.fontSize = node_data['font-size'] + 'px';
      }
      if ('font-weight' in node_data) {
        node_element.style.fontWeight = node_data['font-weight'];
      }
      if ('font-style' in node_data) {
        node_element.style.fontStyle = node_data['font-style'];
      }
      if ('background-image' in node_data) {
        var backgroundImage = node_data['background-image'];
        if (backgroundImage.startsWith('data') && node_data['width'] && node_data['height']) {
          var img = new Image();

          img.onload = function() {
            var c = $c('canvas');
            c.width = node_element.clientWidth;
            c.height = node_element.clientHeight;
            var img = this;
            if (c.getContext) {
              var ctx = c.getContext('2d');
              ctx.drawImage(img, 2, 2, node_element.clientWidth, node_element.clientHeight);
              var scaledImageData = c.toDataURL();
              node_element.style.backgroundImage = 'url(' + scaledImageData + ')';
            }
          };
          img.src = backgroundImage;

        } else {
          node_element.style.backgroundImage = 'url(' + backgroundImage + ')';
        }
        node_element.style.backgroundSize = '99%';

        if ('background-rotation' in node_data) {
          node_element.style.transform = 'rotate(' + node_data['background-rotation'] + 'deg)';
        }
      }
    
      // 添加 文件下载 node_data['isFile']
      if('isFile' in node_data && node_data['isFile']) {
        var ca = $c('a');
        ca.width = node_element.clientWidth;
        ca.height = node_element.clientHeight;
        ca.display = 'inline-block'
        ca.target = '_blank';
        ca.href = node_data['name']
        ca.innerHTML = node_data.name
        node_element.innerHTML = ''
        node_element.appendChild(ca)
      }
    },

    clear_node_custom_style: function(node) {
      var node_element = node._data.view.element;
      node_element.style.backgroundColor = "";
      node_element.style.color = "";
    },

    clear_lines: function(canvas_ctx) {
      var ctx = canvas_ctx || this.canvas_ctx;
      jm.util.canvas.clear(ctx, 0, 0, this.size.w, this.size.h);
    },


    // koringz 需要修改 handle_link
    show_lines: function(canvas_ctx) {
      this.clear_lines(canvas_ctx);
      var nodes = this.jm.mind.nodes;
      var node = null;
      var pin = null;
      var pout = null;
      var _offset = this.get_view_offset();
      for (var nodeid in nodes) {
        node = nodes[nodeid];
        if (!!node.isroot) { continue; }
        if (('visible' in node._data.layout) && !node._data.layout.visible) { continue; }
        pin = this.layout.get_node_point_in(node);
        pout = this.layout.get_node_point_out(node.parent);
        this.draw_line(pout, pin, _offset, canvas_ctx);

        this.handle_link(node, nodes, _offset, canvas_ctx)
      }
    },

    // koringz 关联代码
    handle_link:function(node, node_list, _offset, canvas_ctx) {
        // if(!node.data.isLink) return false

        // debugger
        if(node.data.appendLinks && (node.data.appendLinks instanceof Array) && node.data.appendLinks.length) {
            for(var listID of node.data.appendLinks ){
              if(listID != node.id) {
                if(node_list[listID] == null) break
                var pin = this.layout.get_node_point_in(node);
                var pout = this.layout.get_node_point_out(node_list[listID]);
                this.draw_line(pout,pin,_offset, canvas_ctx, true );
              }
            }
        }
    },

    // koringz 修改关联线 fs = true
    draw_line: function(pin, pout, offset, canvas_ctx, fs) {
      // debugger
      var ctx = canvas_ctx || this.canvas_ctx;
      ctx.strokeStyle = this.opts.line_color;
      ctx.lineWidth = this.opts.line_width;
      ctx.lineCap = 'round';
        // debugger

      if(fs) {
        jm.util.canvas.bezierto(
          ctx, 
          pin.x + offset.x,
          pin.y + offset.y,
          pout.x + offset.x,
          pout.y + offset.y,
          fs);
      }
      else{
        //画折线
        ctx.beginPath();
        ctx.moveTo(pin.x + offset.x, pin.y + offset.y);       //设置起点状态
        ctx.lineTo(pin.x + offset.x, pout.y + offset.y);       //设置末端状态
        ctx.moveTo(pin.x + offset.x, pout.y + offset.y);       //设置起点状态
        ctx.lineTo(pout.x + offset.x, pout.y + offset.y);       //设置末端状态

        ctx.setLineDash([1, 0]);
        ctx.strokeStyle = '#3689c4';
        ctx.stroke();
        ctx.save();

        ctx.translate(pout.x + offset.x - 20, pout.y + offset.y+10);
        // // //我的箭头本垂直向下，算出直线偏离Y的角，然后旋转 ,rotate是顺时针旋转的，所以加个负号
        // 起点 坐标
        // 水平线  x= 5 y =-15 左箭头点
        ctx.lineTo(5,-18);
        // 水平  x= 10 y =-10 凹槽点
        ctx.lineTo(10,-10);
        // 底 左箭头点
        ctx.lineTo(5,-2);
        // 结束点 最右边 箭头顶点 x= 25 y =-10
        ctx.lineTo(25,-10);
        //     //进行绘制
        ctx.fillStyle = '#62cbac'
        ctx.fill(); //箭头是个封闭图形
        ctx.restore();   //非常有用 \= 恢复到堆的上一个状态，其实这里没什么用。
        ctx.closePath();
      }
    }
  };

  // shortcut provider
  jm.shortcut_provider = function(jm, options) {
    this.jm = jm;
    this.opts = options;
    this.mapping = options.mapping;
    this.handles = options.handles;
    this._mapping = {};
  };

  jm.shortcut_provider.prototype = {

    init: function() {
      jm.util.dom.add_event($d, 'keydown', this.handler.bind(this));

      this.handles['addchild'] = this.handle_addchild;
      this.handles['addbrother'] = this.handle_addbrother;
      this.handles['editnode'] = this.handle_editnode;
      this.handles['delnode'] = this.handle_delnode;
      this.handles['toggle'] = this.handle_toggle;
      this.handles['up'] = this.handle_up;
      this.handles['down'] = this.handle_down;
      this.handles['left'] = this.handle_left;
      this.handles['right'] = this.handle_right;

      for (var handle in this.mapping) {
        if (!!this.mapping[handle] && (handle in this.handles)) {
          this._mapping[this.mapping[handle]] = this.handles[handle];
        }
      }
    },

    enable_shortcut: function() {
      this.opts.enable = true;
    },

    disable_shortcut: function() {
      this.opts.enable = false;
    },

    handler: function(e) {
      if (this.jm.view.is_editing()) { return; }
      var evt = e || event;
      if (!this.opts.enable) { return true; }
      var kc = evt.keyCode;
      if (kc in this._mapping) {
        this._mapping[kc].call(this, this.jm, e);
      }
    },

    handle_addchild: function(_jm, e) {
      var selected_node = _jm.get_selected_node();
      if (!!selected_node) {
        var nodeid = jm.util.uuid.newid();
        var node = _jm.add_node(selected_node, nodeid, 'New Node');
        if (!!node) {
          _jm.select_node(nodeid);
          _jm.begin_edit(nodeid);
        }
      }
    },
    handle_addbrother: function(_jm, e) {
      var selected_node = _jm.get_selected_node();
      if (!!selected_node && !selected_node.isroot) {
        var nodeid = jm.util.uuid.newid();
        var node = _jm.insert_node_after(selected_node, nodeid, 'New Node');
        if (!!node) {
          _jm.select_node(nodeid);
          _jm.begin_edit(nodeid);
        }
      }
    },
    handle_editnode: function(_jm, e) {
      var selected_node = _jm.get_selected_node();
      if (!!selected_node) {
        _jm.begin_edit(selected_node);
      }
    },
    handle_delnode: function(_jm, e) {
      var selected_node = _jm.get_selected_node();
      if (!!selected_node && !selected_node.isroot) {
        _jm.select_node(selected_node.parent);
        _jm.remove_node(selected_node);
      }
    },
    handle_toggle: function(_jm, e) {
      var evt = e || event;
      var selected_node = _jm.get_selected_node();
      if (!!selected_node) {
        _jm.toggle_node(selected_node.id);
        evt.stopPropagation();
        evt.preventDefault();
      }
    },
    handle_up: function(_jm, e) {
      var evt = e || event;
      var selected_node = _jm.get_selected_node();
      if (!!selected_node) {
        var up_node = _jm.find_node_before(selected_node);
        if (!up_node) {
          var np = _jm.find_node_before(selected_node.parent);
          if (!!np && np.children.length > 0) {
            up_node = np.children[np.children.length - 1];
          }
        }
        if (!!up_node) {
          _jm.select_node(up_node);
        }
        evt.stopPropagation();
        evt.preventDefault();
      }
    },

    handle_down: function(_jm, e) {
      var evt = e || event;
      var selected_node = _jm.get_selected_node();
      if (!!selected_node) {
        var down_node = _jm.find_node_after(selected_node);
        if (!down_node) {
          var np = _jm.find_node_after(selected_node.parent);
          if (!!np && np.children.length > 0) {
            down_node = np.children[0];
          }
        }
        if (!!down_node) {
          _jm.select_node(down_node);
        }
        evt.stopPropagation();
        evt.preventDefault();
      }
    },

    handle_left: function(_jm, e) {
      this._handle_direction(_jm, e, jm.direction.left);
    },
    handle_right: function(_jm, e) {
      this._handle_direction(_jm, e, jm.direction.right);
    },
    _handle_direction: function(_jm, e, d) {
      var evt = e || event;
      var selected_node = _jm.get_selected_node();
      var node = null;
      if (!!selected_node) {
        if (selected_node.isroot) {
          var c = selected_node.children;
          var children = [];
          for (var i = 0; i < c.length; i++) {
            if (c[i].direction === d) {
              children.push(i)
            }
          }
          node = c[children[Math.floor((children.length - 1) / 2)]];
        } else if (selected_node.direction === d) {
          var children = selected_node.children;
          var childrencount = children.length;
          if (childrencount > 0) {
            node = children[Math.floor((childrencount - 1) / 2)]
          }
        } else {
          node = selected_node.parent;
        }
        if (!!node) {
          _jm.select_node(node);
        }
        evt.stopPropagation();
        evt.preventDefault();
      }
    },
  };


  // plugin
  jm.plugin = function(name, init) {
    this.name = name;
    this.init = init;
  };

  jm.plugins = [];

  jm.register_plugin = function(plugin) {
    if (plugin instanceof jm.plugin) {
      jm.plugins.push(plugin);
    }
  };

  jm.init_plugins = function(sender) {
    $w.setTimeout(function() {
      jm._init_plugins(sender);
    }, 0);
  };

  jm._init_plugins = function(sender) {
    var l = jm.plugins.length;
    var fn_init = null;
    for (var i = 0; i < l; i++) {
      fn_init = jm.plugins[i].init;
      if (typeof fn_init === 'function') {
        fn_init(sender);
      }
    }
  };

  // quick way
  jm.show = function(options, mind) {
    var _jm = new jm(options);
    _jm.show(mind);
    return _jm;
  };

  $w[__name__] = jm;
})(window);



/*
 * Released under BSD License
 * Copyright (c) 2014-2015 hizzgdev@163.com
 *
 * Project Home:
 *   https://github.com/hizzgdev/jsmind/
 */
(function($w) {
  'use strict';
  var $d = $w.document;
  var __name__ = 'jsMind';
  var jsMind = $w[__name__];
  if (!jsMind) { return; }
  if (typeof jsMind.draggable != 'undefined') { return; }

  var jdom = jsMind.util.dom;
  var jcanvas = jsMind.util.canvas;

  var clear_selection = 'getSelection' in $w ? function() {
    $w.getSelection().removeAllRanges();
  } : function() {
    $d.selection.empty();
  };

  var options = {
    line_width: 5,
    lookup_delay: 500,
    lookup_interval: 80
  };

  jsMind.draggable = function(jm) {
    this.jm = jm;
    this.e_canvas = null;
    this.canvas_ctx = null;
    this.shadow = null;
    this.shadow_w = 0;
    this.shadow_h = 0;
    this.active_node = null;
    this.target_node = null;
    this.target_direct = null;
    this.client_w = 0;
    this.client_h = 0;
    this.offset_x = 0;
    this.offset_y = 0;
    this.hlookup_delay = 0;
    this.hlookup_timer = 0;
    this.capture = false;
    this.moved = false;
  };

  jsMind.draggable.prototype = {
    init: function() {
      this._create_canvas();
      this._create_shadow();
      this._event_bind();
    },

    resize: function() {
      this.jm.view.e_nodes.appendChild(this.shadow);
      this.e_canvas.width = this.jm.view.size.w;
      this.e_canvas.height = this.jm.view.size.h;
    },

    _create_canvas: function() {
      var c = $d.createElement('canvas');
      this.jm.view.e_panel.appendChild(c);
      var ctx = c.getContext('2d');
      this.e_canvas = c;
      this.canvas_ctx = ctx;
    },

    _create_shadow: function() {
      var s = $d.createElement('jmnode');
      s.style.visibility = 'hidden';
      s.style.zIndex = '3';
      s.style.cursor = 'move';
      s.style.opacity = '0.7';
      this.shadow = s;
    },

    reset_shadow: function(el) {
      var s = this.shadow.style;
      this.shadow.innerHTML = el.innerHTML;
      s.left = el.style.left;
      s.top = el.style.top;
      s.width = el.style.width;
      s.height = el.style.height;
      s.backgroundImage = el.style.backgroundImage;
      s.backgroundSize = el.style.backgroundSize;
      s.transform = el.style.transform;
      this.shadow_w = this.shadow.clientWidth;
      this.shadow_h = this.shadow.clientHeight;

    },

    show_shadow: function() {
      if (!this.moved) {
        this.shadow.style.visibility = 'visible';
      }
    },

    hide_shadow: function() {
      this.shadow.style.visibility = 'hidden';
    },

    clear_lines: function() {
      jcanvas.clear(this.canvas_ctx, 0, 0, this.jm.view.size.w, this.jm.view.size.h);
    },

    _magnet_shadow: function(node) {
      if (!!node) {
        this.canvas_ctx.lineWidth = options.line_width;
        this.canvas_ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        this.canvas_ctx.lineCap = 'round';
        this.clear_lines();
        jcanvas.lineto(this.canvas_ctx,
          node.sp.x,
          node.sp.y,
          node.np.x,
          node.np.y);
      }
    },

    _lookup_close_node: function() {
      var root = this.jm.get_root();
      var root_location = root.get_location();
      var root_size = root.get_size();
      var root_x = root_location.x + root_size.w / 2;

      var sw = this.shadow_w;
      var sh = this.shadow_h;
      var sx = this.shadow.offsetLeft;
      var sy = this.shadow.offsetTop;

      var ns, nl;

      var direct = (sx + sw / 2) >= root_x ?
        jsMind.direction.right : jsMind.direction.left;
      var nodes = this.jm.mind.nodes;
      var node = null;
      var min_distance = Number.MAX_VALUE;
      var distance = 0;
      var closest_node = null;
      var closest_p = null;
      var shadow_p = null;
      for (var nodeid in nodes) {
        var np, sp;
        node = nodes[nodeid];
        if (node.isroot || node.direction == direct) {
          if (node.id == this.active_node.id) {
            continue;
          }
          ns = node.get_size();
          nl = node.get_location();
          if (direct == jsMind.direction.right) {
            if (sx - nl.x - ns.w <= 0) { continue; }
            distance = Math.abs(sx - nl.x - ns.w) + Math.abs(sy + sh / 2 - nl.y - ns.h / 2);
            np = { x: nl.x + ns.w - options.line_width, y: nl.y + ns.h / 2 };
            sp = { x: sx + options.line_width, y: sy + sh / 2 };
          } else {
            if (nl.x - sx - sw <= 0) { continue; }
            distance = Math.abs(sx + sw - nl.x) + Math.abs(sy + sh / 2 - nl.y - ns.h / 2);
            np = { x: nl.x + options.line_width, y: nl.y + ns.h / 2 };
            sp = { x: sx + sw - options.line_width, y: sy + sh / 2 };
          }
          if (distance < min_distance) {
            closest_node = node;
            closest_p = np;
            shadow_p = sp;
            min_distance = distance;
          }
        }
      }
      var result_node = null;
      if (!!closest_node) {
        result_node = {
          node: closest_node,
          direction: direct,
          sp: shadow_p,
          np: closest_p
        };
      }
      return result_node;
    },

    lookup_close_node: function() {
      var node_data = this._lookup_close_node();
      if (!!node_data) {
        this._magnet_shadow(node_data);
        this.target_node = node_data.node;
        this.target_direct = node_data.direction;
      }
    },

    handleItem: function (arr, value) {
      let newarr = []
      arr.forEach(function (item, index) {
        if(item != value) {
          newarr.push(item)
        }
      })
      return newarr
    },

    // koringz 执行 清除 关联 函数
    clearLinksFunction: function (e) {
        // debugger
      var self = this
      if (!this.jm.get_editable()) { return; }
      if (this.capture) { return; }

      var jview = this.jm.view;
      var el = e.target || event.srcElement;
      if (el.tagName.toLowerCase() != 'jmnode') { return; }
      var nodeid = jview.get_binded_nodeid(el);
      if (!!nodeid) {
        // 当前项
        var node = this.jm.get_node(nodeid);

        // 是否关联通道
        var isLinkChannel = this.jm.clearLinkChannel
        var _clearLinks = this.jm.clearLinks

        // 被清除 节点
        var beClearNode = this.jm.get_node(_clearLinks);
        // 被清除 数组
        var _beClearLinks = beClearNode.data.appendLinks

        // 当前清除 节点
        var _appendLinks = node.data.appendLinks
        if(isLinkChannel) {
          // 匹配 清除与被清除 二者关联
          if(_appendLinks) {
            if(_appendLinks.includes(_clearLinks)) {
              // 处理过滤节点 返回新关联数组
              let filterLinks = this.handleItem(_appendLinks, _clearLinks)
              // 第二个参数是数组 =  [ 结束时选中节点,  过滤被选节点 ]
              kmsjsmap.onFinalDeleteRelation(this, [node, filterLinks], function () {
                node.data.appendLinks = filterLinks
                self.jm.clearLinkChannel = false
                self.jm.clearLinks = ''
                self.jm.link_node(node)
              })
            }
          }
          else if(_beClearLinks) {
            if(_beClearLinks.includes(nodeid)) {
              let filterLinks = this.handleItem(_beClearLinks, nodeid)
              kmsjsmap.onFinalDeleteRelation(this, [beClearNode, filterLinks], function () {
                  beClearNode.data.appendLinks = filterLinks
                  self.jm.clearLinkChannel = false
                  self.jm.clearLinks = ''
                  self.jm.link_node(node)
              })
            }
          }

        }
      }

    },

    // koringz 执行 添加 关联 函数
    addLinksFunction: function (e) {
      var self = this
      if (!this.jm.get_editable()) { return; }
      if (this.capture) { return; }

      var jview = this.jm.view;
      var el = e.target || event.srcElement;
      if (el.tagName.toLowerCase() != 'jmnode') { return; }
      var nodeid = jview.get_binded_nodeid(el);
      if (!!nodeid) {
        // 当前项
        // debugger
        var node = this.jm.get_node(nodeid);
        node.data.isLink = true
        // 是否 添加关联 通道
        var isAddLinkChannel = this.jm.addLinkChannel
        // 添加关联 id
        var _addLinks = this.jm.addLinks
        // 被添加关联 节点
        var beNode = this.jm.get_node(_addLinks);

        if(isAddLinkChannel) {
          if(node.data.appendLinks) {
            if(!node.data.appendLinks.includes(_addLinks)) {
              var currentNode = this.jm.get_selected_node();
                // 第一个节点 结束 节点 
                // 第二个 数组 [ 结束关联 id, 开始关联 id ]
                // 第一个参数 当前节点
                // 第二个参数 关联数组 = 被选中节点关联 和 选择节点id
                // 第三个参数 回调方法
                kmsjsmap.onFinalRelation(currentNode, [...currentNode.data.appendLinks, _addLinks], function () {
                  node.data.appendLinks.push(_addLinks);
                  self.jm.addLinkChannel = false
                  self.jm.addLinks = ''
                  self.jm.link_node(node)
              });
            }
          }
          else {
            var currentNode = this.jm.get_selected_node();
            // 第一个节点 结束 节点 
            // 第二个 数组 [ 结束关联 id, 开始关联 id ]
            // 第一个参数 当前节点
            // 第二个参数 关联数组 = 被选中节点关联 和 选择节点id
            // 第三个参数 回调方法
            kmsjsmap.onFinalRelation(currentNode, [_addLinks], function () {
              node.data.appendLinks = [_addLinks];
              self.jm.addLinkChannel = false
              self.jm.addLinks = ''
              self.jm.link_node(node)
            });
          }

        }
      }
    },

    // koringz 清除关联 事件 contextmenu
    _event_bind: function() {
      var jd = this;
      var container = this.jm.view.container;
      // 鼠标右键 (leo 加的)
      jdom.add_event(container, 'contextmenu', function(e) {
        // console.log('鼠标右键')
        var evt = e || event;
        jd.dragend.call(jd, evt);
      });
      // 鼠标按下
      jdom.add_event(container, 'mousedown', function(e) {
        // console.log('鼠标按下')
        $conTextMenu.hide();
        var evt = e || event;
        jd.dragstart.call(jd, evt);
      });
      // 鼠标移动
      jdom.add_event(container, 'mousemove', function(e) {
        // console.log('鼠标移动')
        var evt = e || event;
        jd.drag.call(jd, evt);
      });
      // 鼠标弹起
      jdom.add_event(container, 'mouseup', function(e) {
        // console.log('鼠标弹起')
        var evt = e || event;
        jd.dragend.call(jd, evt);
      });
      jdom.add_event(container, 'touchstart', function(e) {
        // console.log('touchstart')
        var evt = e || event;
        jd.dragstart.call(jd, evt);
      });
      jdom.add_event(container, 'touchmove', function(e) {
        // console.log('touchmove')
        var evt = e || event;
        jd.drag.call(jd, evt);
      });
      jdom.add_event(container, 'touchend', function(e) {
        // console.log('touchend')
        var evt = e || event;
        jd.dragend.call(jd, evt);
      });

      // koringz 点击清除关联事件
      jdom.add_event(container, 'click', function(e) {
        // console.log('鼠标点击')
        var evt = e || event;
        // debugger
        if(jd.jm.clearLinkChannel) {
          // 清除关联结束回调
          jd.clearLinksFunction.call(jd, evt)
        }
        if(jd.jm.addLinkChannel) {
          // 添加关联结束回调
          jd.addLinksFunction.call(jd, evt)
        }
        // koringz 获取 data 数据
        // console.log(jd.jm.get_data())
      })
    },

    dragstart: function(e) {
      if (!this.jm.get_editable()) { return; }
      if (this.capture) { return; }
      this.active_node = null;

      var jview = this.jm.view;
      var el = e.target || event.srcElement;
      if (el.tagName.toLowerCase() != 'jmnode') { return; }
      var nodeid = jview.get_binded_nodeid(el);
      if (!!nodeid) {
        var node = this.jm.get_node(nodeid);
        if (!node.isroot) {
          this.reset_shadow(el);
          this.active_node = node;
          this.offset_x = (e.clientX || e.touches[0].clientX) - el.offsetLeft;
          this.offset_y = (e.clientY || e.touches[0].clientY) - el.offsetTop;
          this.client_hw = Math.floor(el.clientWidth / 2);
          this.client_hh = Math.floor(el.clientHeight / 2);
          if (this.hlookup_delay != 0) {
            $w.clearTimeout(this.hlookup_delay);
          }
          if (this.hlookup_timer != 0) {
            $w.clearInterval(this.hlookup_timer);
          }
          var jd = this;
          this.hlookup_delay = $w.setTimeout(function() {
            jd.hlookup_delay = 0;
            jd.hlookup_timer = $w.setInterval(function() {
              jd.lookup_close_node.call(jd);
            }, options.lookup_interval);
          }, options.lookup_delay);
          this.capture = true;
        }
      }
    },

    drag: function(e) {
      if (!this.jm.get_editable()) { return; }
      if (this.capture) {
        e.preventDefault();
        this.show_shadow();
        this.moved = true;
        clear_selection();
        var px = (e.clientX || e.touches[0].clientX) - this.offset_x;
        var py = (e.clientY || e.touches[0].clientY) - this.offset_y;
        var cx = px + this.client_hw;
        var cy = py + this.client_hh;
        this.shadow.style.left = px + 'px';
        this.shadow.style.top = py + 'px';
        clear_selection();
      }
    },

    dragend: function(e) {
      if (!this.jm.get_editable()) { return; }
      if (this.capture) {
        if (this.hlookup_delay != 0) {
          $w.clearTimeout(this.hlookup_delay);
          this.hlookup_delay = 0;
          this.clear_lines();
        }
        if (this.hlookup_timer != 0) {
          $w.clearInterval(this.hlookup_timer);
          this.hlookup_timer = 0;
          this.clear_lines();
        }
        if (this.moved) {
          var src_node = this.active_node;
          var target_node = this.target_node;
          var target_direct = this.target_direct;
          this.move_node(src_node, target_node, target_direct);
        }
        this.hide_shadow();
      }
      this.moved = false;
      this.capture = false;
    },

    move_node: function(src_node, target_node, target_direct) {
      var shadow_h = this.shadow.offsetTop;
      if (!!target_node && !!src_node && !jsMind.node.inherited(src_node, target_node)) {
        // lookup before_node
        var sibling_nodes = target_node.children;
        var sc = sibling_nodes.length;
        var node = null;
        var delta_y = Number.MAX_VALUE;
        var node_before = null;
        var beforeid = '_last_';
        while (sc--) {
          node = sibling_nodes[sc];
          if (node.direction == target_direct && node.id != src_node.id) {
            var dy = node.get_location().y - shadow_h;
            if (dy > 0 && dy < delta_y) {
              delta_y = dy;
              node_before = node;
              beforeid = '_first_';
            }
          }
        }
        if (!!node_before) { beforeid = node_before.id; }
        this.jm.move_node(src_node.id, beforeid, target_node.id, target_direct);
      }
      this.active_node = null;
      this.target_node = null;
      this.target_direct = null;
    },

    jm_event_handle: function(type, data) {
      if (type === jsMind.event_type.resize) {
        this.resize();
      }
    }
  };

  var draggable_plugin = new jsMind.plugin('draggable', function(jm) {
    var jd = new jsMind.draggable(jm);
    jd.init();
    jm.add_event_listener(function(type, data) {
      jd.jm_event_handle.call(jd, type, data);
    });
  });

  jsMind.register_plugin(draggable_plugin);

})(window);


/*
 * Released under BSD License
 * Copyright (c) 2014-2015 hizzgdev@163.com
 *
 * Project Home:
 *   https://github.com/hizzgdev/jsmind/
 */

(function($w) {
  'use strict';

  var __name__ = 'jsMind';
  var jsMind = $w[__name__];
  if (!jsMind) { return; }
  if (typeof jsMind.screenshot != 'undefined') { return; }

  var $d = $w.document;
  var $c = function(tag) { return $d.createElement(tag); };

  var css = function(cstyle, property_name) {
    return cstyle.getPropertyValue(property_name);
  };
  var is_visible = function(cstyle) {
    var visibility = css(cstyle, 'visibility');
    var display = css(cstyle, 'display');
    return (visibility !== 'hidden' && display !== 'none');
  };
  var jcanvas = jsMind.util.canvas;
  jcanvas.rect = function(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
  };

  jcanvas.text_multiline = function(ctx, text, x, y, w, h, lineheight) {
    var line = '';
    var text_len = text.length;
    var chars = text.split('');
    var test_line = null;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    for (var i = 0; i < text_len; i++) {
      test_line = line + chars[i];
      if (ctx.measureText(test_line).width > w && i > 0) {
        ctx.fillText(line, x, y);
        line = chars[i];
        y += lineheight;
      } else {
        line = test_line;
      }
    }
    ctx.fillText(line, x, y);
  };

  jcanvas.text_ellipsis = function(ctx, text, x, y, w, h) {
    var center_y = y + h / 2;
    var text = jcanvas.fittingString(ctx, text, w);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, center_y, w);
  };

  jcanvas.fittingString = function(ctx, text, max_width) {
    var width = ctx.measureText(text).width;
    var ellipsis = '…'
    var ellipsis_width = ctx.measureText(ellipsis).width;
    if (width <= max_width || width <= ellipsis_width) {
      return text;
    } else {
      var len = text.length;
      while (width >= max_width - ellipsis_width && len-- > 0) {
        text = text.substring(0, len);
        width = ctx.measureText(text).width;
      }
      return text + ellipsis;
    }
  };

  jcanvas.image = function(ctx, backgroundUrl, x, y, w, h, r, rotation, callback) {
    var img = new Image();
    img.onload = function() {
      ctx.save();
      ctx.translate(x, y);
      ctx.save();
      ctx.beginPath();
      jcanvas.rect(ctx, 0, 0, w, h, r);
      ctx.closePath();
      ctx.clip();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(rotation * Math.PI / 180);
      ctx.drawImage(img, -w / 2, -h / 2);
      ctx.restore();
      ctx.restore();
      callback();
    }
    img.src = backgroundUrl;
  };

  jsMind.screenshot = function(jm) {
    this.jm = jm;
    this.canvas_elem = null;
    this.canvas_ctx = null;
    this._inited = false;
  };

  jsMind.screenshot.prototype = {
    init: function() {
      if (this._inited) { return; }
      var c = $c('canvas');
      var ctx = c.getContext('2d');

      this.canvas_elem = c;
      this.canvas_ctx = ctx;
      this.jm.view.e_panel.appendChild(c);
      this._inited = true;
      this.resize();
    },

    shoot: function(callback) {
      this.init();
      this._watermark();
      var jms = this;
      this._draw(function() {
        if (!!callback) {
          callback(jms);
        }
        jms.clean();
      });
    },

    shootDownload: function() {
      this.shoot(function(jms) {
        jms._download();
      });
    },

    shootAsDataURL: function(callback) {
      this.shoot(function(jms) {
        callback(jms.canvas_elem.toDataURL());
      });
    },

    resize: function() {
      if (this._inited) {
        this.canvas_elem.width = this.jm.view.size.w;
        this.canvas_elem.height = this.jm.view.size.h;
      }
    },

    clean: function() {
      var c = this.canvas_elem;
      this.canvas_ctx.clearRect(0, 0, c.width, c.height);
    },

    _draw: function(callback) {
      var ctx = this.canvas_ctx;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      this._draw_lines();
      this._draw_nodes(callback);
    },

    _watermark: function() {
      var c = this.canvas_elem;
      var ctx = this.canvas_ctx;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = '#000';
      ctx.font = '11px Verdana,Arial,Helvetica,sans-serif';
      ctx.fillText('hizzgdev.github.io/jsmind', c.width - 5.5, c.height - 2.5);
      ctx.textAlign = 'left';
      ctx.fillText($w.location, 5.5, c.height - 2.5);
    },

    _draw_lines: function() {
      this.jm.view.show_lines(this.canvas_ctx);
    },

    _draw_nodes: function(callback) {
      var nodes = this.jm.mind.nodes;
      var node;
      for (var nodeid in nodes) {
        node = nodes[nodeid];
        this._draw_node(node);
      }

      function check_nodes_ready() {
        var allOk = true;
        for (var nodeid in nodes) {
          node = nodes[nodeid];
          allOk = allOk & node.ready;
        }

        if (!allOk) {
          $w.setTimeout(check_nodes_ready, 200);
        } else {
          $w.setTimeout(callback, 200);
        }
      }
      check_nodes_ready();
    },

    _draw_node: function(node) {
      var ctx = this.canvas_ctx;
      var view_data = node._data.view;
      var node_element = view_data.element;
      var ncs = getComputedStyle(node_element);
      if (!is_visible(ncs)) {
        node.ready = true;
        return;
      }

      var bgcolor = css(ncs, 'background-color');
      var round_radius = parseInt(css(ncs, 'border-top-left-radius'));
      var color = css(ncs, 'color');
      var padding_left = parseInt(css(ncs, 'padding-left'));
      var padding_right = parseInt(css(ncs, 'padding-right'));
      var padding_top = parseInt(css(ncs, 'padding-top'));
      var padding_bottom = parseInt(css(ncs, 'padding-bottom'));
      var text_overflow = css(ncs, 'text-overflow');
      var font = css(ncs, 'font-style') + ' ' +
        css(ncs, 'font-variant') + ' ' +
        css(ncs, 'font-weight') + ' ' +
        css(ncs, 'font-size') + '/' + css(ncs, 'line-height') + ' ' +
        css(ncs, 'font-family');

      var rb = {
        x: view_data.abs_x,
        y: view_data.abs_y,
        w: view_data.width + 1,
        h: view_data.height + 1
      };
      var tb = {
        x: rb.x + padding_left,
        y: rb.y + padding_top,
        w: rb.w - padding_left - padding_right,
        h: rb.h - padding_top - padding_bottom
      };

      ctx.font = font;
      ctx.fillStyle = bgcolor;
      ctx.beginPath();
      jcanvas.rect(ctx, rb.x, rb.y, rb.w, rb.h, round_radius);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = color;
      if ('background-image' in node.data) {
        var backgroundUrl = css(ncs, 'background-image').slice(5, -2);
        node.ready = false;
        var rotation = 0;
        if ('background-rotation' in node.data) {
          rotation = node.data['background-rotation'];
        }
        jcanvas.image(ctx, backgroundUrl, rb.x, rb.y, rb.w, rb.h, round_radius, rotation,
          function() {
            node.ready = true;
          });
      }
      if (!!node.topic) {
        if (text_overflow === 'ellipsis') {
          jcanvas.text_ellipsis(ctx, node.topic, tb.x, tb.y, tb.w, tb.h);
        } else {
          var line_height = parseInt(css(ncs, 'line-height'));
          jcanvas.text_multiline(ctx, node.topic, tb.x, tb.y, tb.w, tb.h, line_height);
        }
      }
      if (!!view_data.expander) {
        this._draw_expander(view_data.expander);
      }
      if (!('background-image' in node.data)) {
        node.ready = true;
      }
    },

    _draw_expander: function(expander) {
      var ctx = this.canvas_ctx;
      var ncs = getComputedStyle(expander);
      if (!is_visible(ncs)) { return; }

      var style_left = css(ncs, 'left');
      var style_top = css(ncs, 'top');
      var font = css(ncs, 'font');
      var left = parseInt(style_left);
      var top = parseInt(style_top);
      var is_plus = expander.innerHTML === '+';

      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.arc(left + 7, top + 7, 5, 0, Math.PI * 2, true);
      ctx.moveTo(left + 10, top + 7);
      ctx.lineTo(left + 4, top + 7);
      if (is_plus) {
        ctx.moveTo(left + 7, top + 4);
        ctx.lineTo(left + 7, top + 10);
      }
      ctx.closePath();
      ctx.stroke();
    },

    _download: function() {
      var c = this.canvas_elem;
      var name = this.jm.mind.name + '.png';

      if (navigator.msSaveBlob && (!!c.msToBlob)) {
        var blob = c.msToBlob();
        navigator.msSaveBlob(blob, name);
      } else {
        var bloburl = this.canvas_elem.toDataURL();
        var anchor = $c('a');
        if ('download' in anchor) {
          anchor.style.visibility = 'hidden';
          anchor.href = bloburl;
          anchor.download = name;
          $d.body.appendChild(anchor);
          var evt = $d.createEvent('MouseEvents');
          evt.initEvent('click', true, true);
          anchor.dispatchEvent(evt);
          $d.body.removeChild(anchor);
        } else {
          location.href = bloburl;
        }
      }
    },

    jm_event_handle: function(type, data) {
      if (type === jsMind.event_type.resize) {
        this.resize();
      }
    }
  };

  var screenshot_plugin = new jsMind.plugin('screenshot', function(jm) {
    var jss = new jsMind.screenshot(jm);
    jm.screenshot = jss;
    jm.shoot = function() {
      jss.shoot();
    };
    jm.add_event_listener(function(type, data) {
      jss.jm_event_handle.call(jss, type, data);
    });
  });

  jsMind.register_plugin(screenshot_plugin);

})(window);



/*
 * ContextMenu - jQuery plugin for right-click context menus
 * Version: r2
 * Date: 16 July 2007
 * For documentation visit http://www.trendskitchens.co.nz/jquery/contextmenu/
 */
(function($) {

  var menu, shadow, trigger, content, hash, currentTarget;
  var defaults = {
    menuStyle: {
      listStyle: 'none',
      padding: '1px',
      margin: '0px',
      backgroundColor: '#fff',
      border: '1px solid #999',
      width: '100px'
    },
    itemStyle: {
      margin: '0px',
      color: '#000',
      display: 'block',
      cursor: 'default',
      padding: '3px',
      border: '1px solid #fff',
      backgroundColor: 'transparent'
    },
    itemHoverStyle: {
      border: '1px solid #0a246a',
      backgroundColor: '#b6bdd2'
    },
    eventPosX: 'pageX',
    eventPosY: 'pageY',
    shadow: true,
    onContextMenu: null,
    onShowMenu: null
  };

  $.fn.contextMenu = function(id, options) {
    if (!menu) { // Create singleton menu
      menu = $('<div id="jqContextMenu"></div>')
        .hide()
        .css({ position: 'absolute', zIndex: '500' })
        .appendTo('body')
        .bind('click', function(e) {
          e.stopPropagation();
        });
    }
    if (!shadow) {
      shadow = $('<div></div>')
        .css({ backgroundColor: '#000', position: 'absolute', opacity: 0.2, zIndex: 499 })
        .appendTo('body')
        .hide();
    }
    hash = hash || [];
    hash.push({
      id: id,
      menuStyle: $.extend({}, defaults.menuStyle, options.menuStyle || {}),
      itemStyle: $.extend({}, defaults.itemStyle, options.itemStyle || {}),
      itemHoverStyle: $.extend({}, defaults.itemHoverStyle, options.itemHoverStyle || {}),
      bindings: options.bindings || {},
      shadow: options.shadow || options.shadow === false ? options.shadow : defaults.shadow,
      onContextMenu: options.onContextMenu || defaults.onContextMenu,
      onShowMenu: options.onShowMenu || defaults.onShowMenu,
      eventPosX: options.eventPosX || defaults.eventPosX,
      eventPosY: options.eventPosY || defaults.eventPosY
    });

    var index = hash.length - 1;
    $(this).bind('contextmenu', function(e) {
      // Check if onContextMenu() defined
      var bShowContext = (!!hash[index].onContextMenu) ? hash[index].onContextMenu(e) : true;
      if (bShowContext) display(index, this, e, options);
      return false;
    });
    return this;
  };

  function display(index, trigger, e, options) {
    var cur = hash[index];
    content = $('#' + cur.id).find('ul:first').clone(true);
    content.css(cur.menuStyle).find('li').css(cur.itemStyle).hover(
      function() {
        $(this).css(cur.itemHoverStyle);
      },
      function() {
        $(this).css(cur.itemStyle);
      }
    ).find('img').css({ verticalAlign: 'middle', paddingRight: '2px' });

    // Send the content to the menu
    menu.html(content);

    // if there's an onShowMenu, run it now -- must run after content has been added
    // if you try to alter the content variable before the menu.html(), IE6 has issues
    // updating the content
    if (!!cur.onShowMenu) menu = cur.onShowMenu(e, menu);

    $.each(cur.bindings, function(id, func) {
      $('#' + id, menu).bind('click', function(ev) {
        hide();
        func(trigger, e.currentTarget);
      });
    });

    var left = e[cur.eventPosX];
    var top = e[cur.eventPosY];
    if (left + menu.outerWidth() > $(document.body).width()) {
      left -= menu.outerWidth();
    }

    if (top + menu.outerHeight() > $(document.body).height()) {
      top -= menu.outerHeight();
    }

    menu.css({ 'left': left, 'top': top }).show();
    //if (cur.shadow) shadow.css({ width: menu.width(), height: menu.height(), left: e.pageX + 2, top: e.pageY + 2 }).show();
    if (cur.shadow) shadow.css({ width: menu.width(), height: menu.height(), left: left + 2, top: top + 2 }).show();
    $(document).one('click', hide);
  }

  function hide() {
    menu.hide();
    shadow.hide();
  }

  // Apply defaults
  $.contextMenu = {
    defaults: function(userDefaults) {
      $.each(userDefaults, function(i, val) {
        if (typeof val == 'object' && defaults[i]) {
          $.extend(defaults[i], val);
        } else defaults[i] = val;
      });
    }
  };

})(jQuery);


// kmsjsmap
// 思维导图JS库
(function($w) {
  if (!$w.jsMind) return;

  var __NAME__ = 'kmsjsmap'
  var logger = (typeof console === 'undefined') ? {
    log: _noop,
    debug: _noop,
    error: _noop,
    warn: _noop,
    info: _noop
  } : console;
  if(!logger.debug) logger.debug = _noop;


  if (typeof module === 'undefined' || !module.exports) {
    if (typeof $w[__NAME__] !== 'undefined') {
      logger.log(__NAME__ + '已经存在啦啦啦啦~');
      return;
    }
  }

  var kmsjsmap = {
    options: '',
    isInit: false,
    editable: true,
    onRelation: _noop,
    onFinalRelation: _noop,
    onFinalDeleteRelation: _noop,
    onDeleteRelation: _noop,
    onCreateNode: _noop,
    onDeleteNode: _noop,
    onKoringzData: _noop,
    onEditeNodeData: _noop,
  }


  kmsjsmap.init = function(options) {
    // console.log('init:', options)
    if (!options || Object.keys(options).length === 0) {
      logger.warn('请对' + __NAME__ + '.init()传入必要的参数');
      return;
    }
    // if (this.isInit) return;
    // this.isInit = true;
    this.options = options;
    this.editable = options.editable === true ? true : false;
    if (options.onRelation) this.onRelation = options.onRelation;
    if (options.onFinalRelation) this.onFinalRelation = options.onFinalRelation;
    if (options.onFinalDeleteRelation) this.onFinalDeleteRelation = options.onFinalDeleteRelation;
    if (options.onDeleteRelation) this.onDeleteRelation = options.onDeleteRelation;
    if (options.onCreateNode) this.onCreateNode = options.onCreateNode;
    if (options.onDeleteNode) this.onDeleteNode = options.onDeleteNode;
    if (options.onKoringzData) this.onKoringzData = options.onKoringzData;
    if (options.onEditeNodeData) this.onEditeNodeData = options.onEditeNodeData;
    this._load_jsmind();
    this._init_button();
  }

  var _jm = null;

  // 初始化思维导图
  kmsjsmap._load_jsmind = function() {
    var options = {
      container: this.options.container,
      editable: this.editable,
      theme: 'kms1',
      mode: 'full',
      shortcut: {
        enable: false // 是否启用快捷键
      },
      onRelation: this.onRelation,
      onFinalRelation: this.onFinalRelation,
      onFinalDeleteRelation: this.onFinalDeleteRelation,
      onDeleteRelation: this.onDeleteRelation,
      onCreateNode: this.onCreateNode,
      onDeleteNode: this.onDeleteNode,
      onKoringzData: this.onKoringzData,
      onEditeNodeData: this.onEditeNodeData,
      view: {
        line_width: 2,
        line_color: '#5385EE'
      }
    }
    var mind = {
      'meta': {
        'name': '思维导图JS库',
        'author': 'Leo',
        'version': '1.0'
      },
      'format': 'node_array',
      'data': this.options.data
    }
    _jm = new jsMind(options);
    _jm.show(mind);

    var innerToolBar = $("<div class='lui-jsmind-innerToolBar'><ul><li class='lui_map_icon_zoom_reset mui mui-history_handler_back' title='还原' data-opt='zoomReset' >还原</li>" +
      " <li class='lui_map_icon_zoom_in mui mui-addition' title='放大' data-opt='zoomIn'>放大</li> " +
      " <li class='lui_map_icon_zoom_out mui mui-delete' title='缩小' data-opt='zoomOut'>缩小</li>" +
      " </ul></div>");

    $(_jm.view.container).prepend(innerToolBar);
    $(_jm.view.container).css("position", "relative");

    var self = this;

    $(innerToolBar).on("click", function(e) {
      var $t = $(e.target),
        type = $t.attr("data-opt");
      if (type) {
        if (self[type]) {
          self[type]();
        }
      }
    });
  }

  // 创建功能按钮
  kmsjsmap._init_button = function() {
    $(function() {
      // 0517去掉 - 内置保存按钮
      // var html = '<a href="javascript: kmsjsmap.onSave()" class="sui-btn btn-xlarge btn-primary">保存思维导图</a>';
      // $('#' + kmsjsmap.options.container).prepend(html);
      // 给每个节点加上右键菜单事件
      $('jmnode').on('contextmenu', kmsjsmap._conTextMenuEvenHandle);
    })
  }


  // 右键菜单方法
  kmsjsmap._conTextMenuEvenHandle = function(e) {
    e.preventDefault();
    if (!kmsjsmap.editable) return;
    // console.log('右键拉拉拉拉')
    $conTextMenu.show().css({
      left: e.pageX,
      top: e.pageY
    })
  }


  kmsjsmap._get_selected_nodeid = function() {
    var selected_node = _jm.get_selected_node();
    if (!!selected_node) {
      return selected_node.id;
    } else {
      return null;
    }
  }


  // 思维导图库JS 保存回调
  kmsjsmap.save = function(cb) {
    var data = _jm.get_data('node_array').data;
    // console.log(data)
    // var cb = this.options.onSave;
    cb && cb(data);
  }


  // 删除节点
  kmsjsmap.del_node = function() {
    var that = this;
    $conTextMenu.hide();
    var flag = confirm('确认删除此节点吗?');
    if (!flag) return;
    var selected_id = that._get_selected_nodeid();
    var node = _jm.get_selected_node();

    kmsjsmap.onDeleteNode(kmsjsmap, _jm, node, function () {
      // 删除节点 外部调用
      _jm.remove_node(selected_id);
    })
    // _jm.remove_node(selected_id);
  }

  // 编辑节点
  kmsjsmap.modify_node = function() {
    $conTextMenu.hide();
    var node = _jm.get_selected_node();
    _jm.begin_edit(node);
  }

  // koringz 新增节点之前 回调函数
  kmsjsmap.create_node = function() {
    $conTextMenu.hide();
    var node = _jm.get_selected_node();
    kmsjsmap.onCreateNode(kmsjsmap, _jm, node)

    //     kmsjsmap.add_node(nodeid, topic)
  }

  //  新增节点 - koringz修改
  kmsjsmap.add_node = function(nodeid = jsMind.util.uuid.newid(), topic = '请输入子节点名称') {
    $conTextMenu.hide();
    var node = _jm.add_node(_jm.get_selected_node(), nodeid, topic, { badge: 0 }, 'right');
    // console.log(node);
    // 添加节点 不可进行编辑功能
    // _jm.begin_edit(node);
    // 为了给新添加的节点也加上右键菜单
    $('jmnode').off('contextmenu', function() {});
    $('jmnode').on('contextmenu', kmsjsmap._conTextMenuEvenHandle);
  }

  // 关联节点
  kmsjsmap.relation_node = function() {
    $conTextMenu.hide();
    var node = _jm.get_selected_node();
    kmsjsmap.onRelation(node);
  }
  // kroingz 删除关联节点
  kmsjsmap.delete_relation_node = function() {
    $conTextMenu.hide();
    var node = _jm.get_selected_node();
    kmsjsmap.onDeleteRelation(node);
  }

  kmsjsmap.screenshot = function() {
    _jm.screenshot.shootDownload();
  }

  kmsjsmap.shootAsDataURL = function(callback) {
    _jm.screenshot.shootAsDataURL(callback);
  }

  kmsjsmap.zoomIn = function() {
    _jm.view.zoomIn();
  }

  kmsjsmap.zoomOut = function() {
    _jm.view.zoomOut();
  }

  kmsjsmap.zoomReset = function() {
    _jm.view.setZoom(1);
  }

  kmsjsmap.fullScreen = function(element) {
    if (!element) element = _jm.view.container;

    var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;

    if (requestMethod) requestMethod.call(element);
  }

  kmsjsmap.exitFullscreen = function(element) {
    var elem = document;
    if (elem.webkitCancelFullScreen) {
      elem.webkitCancelFullScreen();
    } else if (elem.mozCancelFullScreen) {
      element.mozCancelFullScreen();
    } else if (elem.cancelFullScreen) {
      elem.cancelFullScreen();
    } else if (elem.exitFullscreen) {
      elem.exitFullscreen();
    } else {
      //浏览器不支持全屏API或已被禁用
    };
  }

  // koringz 添加 setAddLink 方法
  kmsjsmap.setLinkStatus = function(options, indexValue) {
    var id = options.id;
    var isLink = options.isLink;
    if (!id || typeof isLink !== 'boolean') return logger.error('setLinkStatus传入参数有误');
    var $dom = $('#' + kmsjsmap.options.container).find('jmnode[nodeid="' + id + '"]');
    if (!$dom.length === 0) return;
    var node = _jm.get_selected_node();
    if (isLink) {
      $dom.addClass('isLink');
      node.data.isLink = true;
    } else {
      $dom.removeClass('isLink');
      node.data.isLink = false;
    }

    this.setAddLink(options, indexValue)
  },

  // koringz 关联
  kmsjsmap.setAddLink = function(options, addLinkChannel) {
    var id = options.id;
    var isLink = options.isLink;

    if (!id || typeof isLink !== 'boolean') return logger.error('setLinkStatus传入参数有误');
    var $dom = $('#' + kmsjsmap.options.container).find('jmnode[nodeid="' + id + '"]');
    if (!$dom.length === 0) return;
    var node = _jm.get_selected_node();
    // debugger

    if(isLink) {
      _jm.addLinks = id
      _jm.addLinkChannel = addLinkChannel
    }

    // debugger
    _jm.link_node(node)
  },
  // koringz 清除关联 设置回调函数
  /*
    _jm = {
      clearLinks: id,
      clearLinkChannel: true
    }
  */
  kmsjsmap.setDeleteLink = function(options, clearLinkChannel) {
    // debugger
    var id = options.id;
    var isLink = options.isLink;
    var appendLinks = options.appendLinks;

    if (!id || typeof isLink !== 'boolean') return logger.error('setDeleteLink传入参数有误');
    var $dom = $('#' + kmsjsmap.options.container).find('jmnode[nodeid="' + id + '"]');
    if (!$dom.length === 0) return;
    var node = _jm.get_selected_node();

    // clearLinkChannel 这是清除节点通道条件  回调方法 clearLinksFunction
    if(!isLink) {
      _jm.clearLinks = id
      _jm.clearLinkChannel = clearLinkChannel
    }
  }

  $w[__NAME__] = kmsjsmap
})(window);

