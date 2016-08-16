/**
*
* 用于放置公用方法的工具类
*/

/*
* 比较两个object在内容上是否相等
*/
function isObjectEqual (source, target) {
  const strSource = JSON.stringify(source);
  const strTarget = JSON.stringify(target);
  return strSource === strTarget;
}

module.exports = {
  isObjectEqual
};
