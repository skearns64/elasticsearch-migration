"use strict";

Checks
  .register(
    "index.segments",
    [

    {
      name : "Ancient index segments",
      color : "red",
      check : function(index) {

        var install_1_6 = 'Install Elasticsearch 1.6.x and upgrade this '
          + 'index with the <a href="http://www.elastic.co/guide/en/elasticsearch/reference/current/indices-upgrade.html">`upgrade` API</a>.';

        function check_segment(segment) {
          if (!Checks.get_key(segment, 'version').match('^[45]')) {
            return true;
          }
        }

        function check_shard(shard) {
          return forall(shard.segments, check_segment)
        }

        function check_shard_group(group) {
          return forall(group, check_shard)
        }

        if (Object.keys(index.segments).length == 0) {
          return "This index is closed and cannot be checked for ancient segments."
        }

        if (forall(index.segments.shards, check_shard_group)) {
          return "This index contains segments created before Lucene 4. "
            + install_1_6;
        }

        var created_v = Checks.get_key(index.settings, "index.version.created")
          .match(/^(\d{2,3})\d{4}$/);

        if (created_v && created_v[1] >= 90) {
          return;
        }
        if (Checks.get_key(index.settings, "index.version.minimum_compatible")
          .match(/^2/)) {
          return;
        }

        return "This index was created by an old version of Elasticsearch based on "
          + "Lucene 3."
          + " It no longer contains segments from Lucene 3, but it needs to be "
          + "marked as upgraded. " + install_1_6;
      }
    }

    ]);
