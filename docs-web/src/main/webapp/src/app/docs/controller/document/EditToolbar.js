angular.module('docs').controller('EditToolbar',
function ($scope, $state, $stateParams) {
    $scope.openEditor = function (file) {
    console.log('file.id:', file.id);
    console.log('file.name:', file.name);
    const hashUrl = $state.href('image', {
        fileId: file.id,
        fileName: file.name
    });
    console.log('Generated URL:', hashUrl); // 输出生成的 URL
    window.open(hashUrl, '编辑图像', 'width=1200,height=800');
    };
});