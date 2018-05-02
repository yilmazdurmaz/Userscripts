// ==UserScript==
// @name         Image Proxier YD
// @namespace    https://github.com/YD/Userscripts
// @version      1.2
// @description  Replaces images from stack.imgur.com and collates them
// @author       GrumpyCrouton, yilmazdurmaz
// @match        *://*.stackoverflow.com/*
// @match        *://*.stackexchange.com/*
// @match        *://*.superuser.com/*
// @grant        GM.xmlHttpRequest
// ==/UserScript==

// OPTIONS
var convertImages = true;
// var convertLinks = true;
var convertLinks = true;

var frequencyInSeconds = 5;

var addProxy = true;

//var proxy = "https://web.archive.org/web/";
//var proxy = "https://images.duckduckgo.com/iu/?u=";
var proxy = "http://service.hidebux.com/index.php";
var matchURLs = ["https://i.stack.imgur.com/", "https://i.imgur.com/","http://i.imgur.com/"];


// DO NOT ALTER BELOW THIS LINE

var modal = document.createElement("div");
modal.id = "image-proxier-modal";
modal.style.position = "fixed";
// modal.style.width = "800px";
// modal.style.height = "600px";
// modal.style.top = "50%";
// modal.style.left = "50%";
// modal.style.marginLeft = "-400px";
// modal.style.marginTop = "-300px";
modal.style.border = "5px outset #52575b";
modal.style.zIndex = 999;
modal.style.padding = "5px";
modal.style.background = "white";
modal.style.display = "none";
modal.setAttribute("onmouseover","modalOver1()");
modal.setAttribute("onmouseleave","modalOver0()");

modal.innerHTML = " 															\
<div style='width:100%;text-align:right;'>										\
<strong><div id='image-proxier-close' style='cursor:pointer;'>X</div></strong>	\
</div>																			\
<div style='width:100%;text-align:center;overflow:auto;'>						\
<img id='image-proxier-magnif'></img>											\
</div>																			\
";

document.getElementsByTagName("BODY")[0].appendChild(modal);

if(convertImages) {
    replaceImages();
}

function getMeta(url, callback) {
    var img = new Image();
    img.src = url;
    img.onload = function() { callback(this.width, this.height); };
}
//getMeta( "http://snook.ca/files/mootools_83_snookca.png",function(width, height) { alert(width + 'px ' + height + 'px'); });

var setpre = document.createElement("script");
setpre.innerHTML='\
function setMeta(name,e,url){\
    $("<img/>",{\
        onload : function(){\
alert(name,e,this.width,this.height);\
            setPreview(name,e,this.width,this.height);\
        },\
        src  : url\
    });\
};\
function setPreview(name,e,wX,wY){\
alert("boyut"+wX+":"+wY);\
var posX=window.event.clientX+50;\
var posY=document.documentElement.scrollTop;\
var hY=window.innerHeight;\
var modal = document.querySelector("#image-proxier-modal");\
modal.style.width = "auto";\
modal.style.height = (hY-50)+"px";\
modal.style.maxheight = "1000px";\
modal.style.left = posX+"px";\
modal.style.top = 25+"px";\
var proxierImage = document.querySelector("#image-proxier-magnif");\
proxierImage.src = $(e).attr(name);\
proxierImage.style.width = "auto";\
proxierImage.style.height = "auto";\
proxierImage.style.textAlign = "center";\
proxierImage.style.maxHeight = (hY-100)+"px";\
$("#image-proxier-modal").show();\
}\
';//end
document.getElementsByTagName("BODY")[0].appendChild(setpre);


function goProxy(source,attr,val){
    GM.xmlHttpRequest({synchronous:"True",
                       method: "POST",
                       url: proxy,
                       data: "url="+val,
                       headers: {
                           "Content-Type": "application/x-www-form-urlencoded"
                       },
                       onload: function(response) {
                           //            console.log([
                           // response.status,
                           // response.statusText,
                           // response.readyState,
                           // response.responseHeaders,
                           // response.responseText,
                           //                response.finalUrl,
                           // response.XML
                           //            ].join("\n"));
                           //$( "#notify-container" ).append( response.finalUrl );
                           source.setAttribute(attr,response.finalUrl);
//                           source.setAttribute("onmouseover","setMeta('"+attr+"',this,'"+response.finalUrl+"')");
                           source.setAttribute("onmouseover","showOver('"+attr+"',this)");
                           source.setAttribute("onmouseleave","hideOver()");
                           source.classList="comeover";
                           //console.log(source.src);
                       }
                      });
}
function replaceImages() {
    var allImages = document.getElementsByTagName('img');
    for(var i = 0; i < allImages.length ; i++) {
        var sImage = allImages[i];
        href = sImage.getAttribute('src');
        $(sImage).wrap('<a href="' + href + '" class="link"></a>');
        var result = containsAny(sImage.src, matchURLs);
        //console.log(result);
        if(result) {
            if(addProxy) {
                // sImage.src = proxy + sImage.src;
                goProxy(sImage,"src",sImage.src);

                //console.log(sImage.src);
            }
        }
    }
}

if(convertLinks) {
    // replaceLinks();
    replaceLinksSmall();
}

function replaceLinksSmall() {
    var allLinks = document.getElementsByTagName('a');
    for(var i = 0; i < allLinks.length ; i++) {
        var sLink=allLinks[i];
        var result = containsAny(sLink.href, matchURLs);
        if(result) {
            if(addProxy) {
                console.log(sLink.href);
                goProxy(sLink,"href",sLink.href);
                console.log(sLink.href);
            }
        }
    }
}
function replaceLinks() {
    var links = document.getElementsByTagName('a');
    for(var i = 0; i < links.length ; i++) {
        var matches = containsAny(links[i].href, matchURLs);
        if(matches) {
            //link variables
            var link = links[i];
            var linkParent = links[i].parentNode;

            //create <img> element
            var image = document.createElement("img");
            if(addProxy) {
                goProxy(image,"src",link.href);
            } else {
                image.src = link.href;
            }
            image.style.height = "auto";
            image.style.width = "75px";
            image.style.border = "2px outset #52575b";

            //alter <a> element
            if(addProxy) {
                var temp={src:""};goProxy(temp,"src",link.href);
                //console.log(temp.src);
                link.setAttribute("link", temp.src);
            }
            link.href = "";
            link.classList.add("image-proxier-image");
            link.innerHTML = "";
            link.style.borderBottom = "none";
            link.style.paddingRight = "3px";

            //attach <img> to <a>
            link.append(image);

            result = linkParent.querySelector('.imageContainer');
            if(!result) {
                //create imageContainer (div) element
                var container = document.createElement("div");
                container.classList.add("imageContainer");
                container.style.backgroundColor = "#d4d4d4";

                container.style.padding = "3px";
                linkParent.prepend(container);
                container.prepend(scriptName());
            }
            //append image to container that exists from last check
            linkParent.querySelector(".imageContainer").appendChild(link);
        }
    }
}

$("#image-proxier-close").click(function(){
    $("#image-proxier-modal").hide();
    return false;
});

$(".image-proxier-image").click(function(){
    var proxierImage = document.querySelector("#image-proxier-magnif");
    proxierImage.src = $(this).attr('link');
    proxierImage.style.width = "800px";
    proxierImage.style.height = "auto";
    proxierImage.style.maxHeight = "550px";
    $("#image-proxier-modal").show();
    return false;
});


var showover = document.createElement("script");
showover.innerHTML='\
function showOver(name,e){\
var posX=window.event.clientX+50;\
var posY=document.documentElement.scrollTop;\
var hY=window.innerHeight;\
var modal = document.querySelector("#image-proxier-modal");\
modal.style.width = "auto";\
modal.style.height = (hY-50)+"px";\
modal.style.maxheight = "1000px";\
modal.style.left = posX+"px";\
modal.style.top = 25+"px";\
var proxierImage = document.querySelector("#image-proxier-magnif");\
proxierImage.src = $(e).attr(name);\
proxierImage.style.width = "auto";\
proxierImage.style.height = "auto";\
proxierImage.style.textAlign = "center";\
proxierImage.style.maxHeight = (hY-100)+"px";\
$("#image-proxier-modal").show();}\
function hideOver(){\
$("#image-proxier-modal").hide();}\
function modalOver1(){ }\
function modalOver0(){\
$("#image-proxier-modal").hide();}\
';
//'function showOver(name,e){console.log(name+": "+e.getAttribute(name)+":"+"mouse over");}';
document.getElementsByTagName("BODY")[0].appendChild(showover);

$(document).mouseup(function(e)
                    {
    var container = $("#image-proxier-modal");

    // if the target of the click isn't the container nor a descendant of the container
    if (!container.is(e.target) && container.has(e.target).length === 0) {
        container.hide();
    }
});

function scriptName() {
    var node = document.createElement("div");
    node.style.fontSize = "10px";
    node.style.width = "100%";
    node.innerHTML = "<center><a href='https://github.com/GrumpyCrouton/Userscripts' target='_blank'>Image Proxier</a></center>";
    return node;
}

function containsAny(str, substrings) {
    for (var i = 0; i < substrings.length; i++) {
        if(str.startsWith(substrings[i])) {
            return true;
        }
    }
    return false;
}

// setInterval(function() {
//     if(convertImages) {
//         replaceImages();
//         //console.log("Running image replacements.");
//     }
//     if(convertLinks) {
//         replaceLinksSmall();
//         //console.log("Running link replacements.");
//     }
// }, frequencyInSeconds * 1000); // 60 * 1000 milsec