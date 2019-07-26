<!doctype html>

<html>

<head>
    {% include 'templates/include/head.html' %}

</head>


<body  class="dashboard-init" data-offset="0" ng-cloak ng-controller="AppCtrl">


{% include 'templates/include/header.html' %}


{% include 'templates/include/doc-nav.html' %}

<div class="container-fluid">

  <div class="row">

    <div class="sidebar-gruntfile-trigger mobile-hide col-sm-3" id="left-nav">

      <div class="sidebar-affix-shadow sidebar-hover-off">

        <div class="sidebar-wrapper" id="toc-wrapper">

        </div>
        <!-- .sidebar-wrapper -->

      </div>
      <!-- .sidebar-affix-shadow -->

    </div>
    <!-- .col-md-3 -->

    <div class="col-sm-9 sidebar-gruntfile-trigger">
      <div class="doc-content with-comment" id="content">
        <div class="docs-meta">
          <span class="icon icon-github"></span><a href="https://github.com/leancloud/docs#贡献">编辑文档</a>
        </div>
        {{body}}
      </div>
    </div>
    <!-- .col-md-9 -->
  </div>
  <!-- .row -->

</div>
<!-- .container-fluid -->
{% include 'templates/include/common-footer.html' %}

{% include 'templates/include/footer.html' %}

</body>

</html>
